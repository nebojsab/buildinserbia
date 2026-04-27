import type { AppLocale, PlannerIntakeInput, ToolResult } from "../../types/agentic";
import { extractMunicipalityHint, municipalitySearchUrl } from "../municipalityHint";

export type EstimateOutput = {
  low: number;
  high: number;
  currency: "EUR";
};

export type ResourceOutput = {
  links: Array<{ label: string; href: string }>;
  municipalityHint: string | null;
};

export type ProductOutput = {
  recommendations: string[];
};

export type NextStepsOutput = {
  steps: string[];
};

const L = (locale: AppLocale) => {
  const t = {
    sr: {
      checklists: "BuildInSerbia — provere i spiskovi (check liste)",
      allDocs: "BuildInSerbia — dokumenti i obrasci",
      blog: "Blog: priprema projekta",
      cadastre: "Katastar / RGA — javni pregled (parcela, objekat)",
      euprava: "eUprava — državni servisi i uputstva",
      eupravaPermits: "eUprava — dozvole i postupci",
      ddgMuni: (m: string) => `Veb-pretraga: zvanična stranica opštine (${m})`,
    },
    en: {
      checklists: "BuildInSerbia — checklists and templates",
      allDocs: "BuildInSerbia — all documents",
      blog: "Blog: project preparation",
      cadastre: "Cadastre / RGA — public map (plot, building)",
      euprava: "eUprava — state e‑services (Serbia)",
      eupravaPermits: "eUprava — permits and procedures",
      ddgMuni: (m: string) => `Web search: official municipality page (${m})`,
    },
    ru: {
      checklists: "BuildInSerbia — чек-листы и шаблоны",
      allDocs: "BuildInSerbia — все документы",
      blog: "Блог: подготовка проекта",
      cadastre: "Кадастр / RGA — публичная карта",
      euprava: "eUprava — госуслуги (Сербия)",
      eupravaPermits: "eUprava — разрешения и процедуры",
      ddgMuni: (m: string) => `Поиск: официальный сайт општины (${m})`,
    },
  };
  return t[locale];
};

function estimateBaseByType(projectType: PlannerIntakeInput["projectType"]): number {
  switch (projectType) {
    case "reno":
      return 9000;
    case "newbuild":
      return 70000;
    case "extension":
      return 25000;
    case "interior":
      return 6000;
    case "yard":
      return 3000;
    default:
      return 10000;
  }
}

const EST_ASSUMPTIONS: Record<AppLocale, [string, string]> = {
  sr: [
    "Raspon je informativan i zasniva se na tipičnim cenovnim opsezima.",
    "Precizniji proračun zahteva tačne mere i ponude izvođača.",
  ],
  en: [
    "The range is indicative and based on typical market bands.",
    "A precise budget needs measured quantities and contractor quotes.",
  ],
  ru: [
    "Диапазон ориентировочный, по типичным рыночным вилкам.",
    "Точная смета требует замеров и КП от подрядчиков.",
  ],
};

const PROD_ASSUMPTION: Record<AppLocale, string> = {
  sr: "Preporuke su kratka lista za start — nisu finalna specifikacija.",
  en: "Recommendations are a shortlist to start with — not a final specification.",
  ru: "Краткий список для старта — не финальная спецификация.",
};

const NEXT_ASSUMPTION: Record<AppLocale, string> = {
  sr: "Sledeći koraci su za početnu fazu planiranja.",
  en: "Next steps are for the initial planning phase.",
  ru: "Следующие шаги для начальной фазы планирования.",
};

const RES_ASSUMPTIONS = (locale: AppLocale, hasMuni: boolean): [string, ...string[]] => {
  if (hasMuni) {
    return [
      {
        sr: "Linkovi uključuju generičke državne servise; dodat je i predlog pretrage za lokalnu upravu (opštinu) iz vašeg unosa.",
        en: "Links include generic state services; a suggested web search for your parsed municipality is included.",
        ru: "Ссылки включают общие госуслуги; добавлен поиск по општине из вашего ввода.",
      }[locale],
    ];
  }
  return [
    {
      sr: "Linkovi su odabrani prema tipu projekta. Za lokalne uvjete, dopunite lokaciju (npr. sa „Opština …“).",
      en: "Links are chosen by project type. For local specifics, add a clearer location (e.g. with “municipality …”).",
      ru: "Ссылки по типу проекта. Для локальных нюансов уточните адрес (например, «општина …»).",
    }[locale],
  ];
};

export function runCostEstimationTool(input: PlannerIntakeInput): ToolResult<EstimateOutput> {
  const base = estimateBaseByType(input.projectType);
  const taskMultiplier = Math.max(1, input.tasks.length * 0.35);
  const stageMultiplier = 1 + input.stage * 0.05;
  const budgetMultiplier = input.budget === 1 ? 0.9 : input.budget === 3 ? 1.2 : 1;
  const low = Math.round(base * taskMultiplier * stageMultiplier * budgetMultiplier);
  const high = Math.round(low * 1.35);

  return {
    output: { low, high, currency: "EUR" },
    assumptions: [...EST_ASSUMPTIONS[input.locale]],
    confidence: "medium",
  };
}

export function runResourceLookupTool(input: PlannerIntakeInput): ToolResult<ResourceOutput> {
  const lab = L(input.locale);
  const muni = extractMunicipalityHint(input.location);
  const links: ResourceOutput["links"] = [
    { label: lab.checklists, href: "/documents?tab=checklists" },
    { label: lab.allDocs, href: "/documents" },
    { label: lab.blog, href: "/blog" },
  ];

  if (muni) {
    links.push({ label: lab.ddgMuni(muni), href: municipalitySearchUrl(muni, input.locale) });
  }

  if (input.projectType === "reno" || input.projectType === "interior") {
    links.push(
      { label: lab.cadastre, href: "https://katastar.rga.gov.rs/" },
      { label: lab.euprava, href: "https://www.euprava.gov.rs/" },
    );
  }

  if (input.projectType === "newbuild" || input.projectType === "extension") {
    links.push(
      { label: lab.eupravaPermits, href: "https://www.euprava.gov.rs/" },
      { label: lab.cadastre, href: "https://katastar.rga.gov.rs/" },
    );
  }

  return {
    output: { links, municipalityHint: muni },
    assumptions: RES_ASSUMPTIONS(input.locale, Boolean(muni)),
    confidence: "high",
  };
}

export function runProductRecommendationTool(input: PlannerIntakeInput): ToolResult<ProductOutput> {
  const recommendations: string[] = [];
  if (input.tasks.includes("winreplace")) {
    recommendations.push(
      {
        sr: "PVC/ALU stolarija sa dvoslojnim staklom",
        en: "PVC/ALU joinery with double glazing",
        ru: "PVC/ALU остекление, двойной стеклопакет",
      }[input.locale],
    );
  }
  if (input.tasks.includes("bathreno")) {
    recommendations.push(
      {
        sr: "Vodootporne podloge i keramika (kupatilo)",
        en: "Waterproofing and wall/floor tiles (bathroom)",
        ru: "Гидроизоляция и плитка (санузел)",
      }[input.locale],
    );
  }
  if (input.tasks.includes("ufh")) {
    recommendations.push(
      {
        sr: "Termostatska regulacija i izolacija (podno grejanje)",
        en: "Thermostat zoning and insulation (underfloor heating)",
        ru: "Терморегулирование и изоляция (тёплый пол)",
      }[input.locale],
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      {
        sr: "Kreni od osnovnog paketa materijala po fazama",
        en: "Start with a basic material package phased by work stage",
        ru: "Начните с базового набора материалов по этапам",
      }[input.locale],
    );
  }

  return {
    output: { recommendations },
    assumptions: [PROD_ASSUMPTION[input.locale]],
    confidence: "medium",
  };
}

const NEXT_STEPS: Record<AppLocale, string[]> = {
  sr: [
    "Potvrdite obim radova i prioritetne zadatke.",
    "Proverite nedostajuće podatke (mere, rok, budžet).",
    "Prikupite 2–3 okvirne ponude za ključne stavke.",
  ],
  en: [
    "Confirm scope and priority tasks.",
    "Check for missing data (measurements, deadline, budget).",
    "Collect 2–3 ballpark quotes for key items.",
  ],
  ru: [
    "Подтвердите объём и приоритеты.",
    "Проверьте пробелы (замеры, срок, бюджет).",
    "Соберите 2–3 ориентировочных предложения по ключевым позициям.",
  ],
};

export function runNextStepsTool(input: PlannerIntakeInput): ToolResult<NextStepsOutput> {
  const steps = [...NEXT_STEPS[input.locale]];

  if (input.projectType === "newbuild" || input.projectType === "extension") {
    steps.push(
      {
        sr: "Proverite projektnu dokumentaciju i angažujte licenciranog projektanta gde je potrebno.",
        en: "Check design documentation and engage a licensed designer where required.",
        ru: "Проверьте проектную документацию и лицензированного проектировщика при необходимости.",
      }[input.locale],
    );
  }

  return {
    output: { steps },
    assumptions: [NEXT_ASSUMPTION[input.locale]],
    confidence: "high",
  };
}
