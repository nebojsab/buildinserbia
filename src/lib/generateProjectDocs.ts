import { humanizeIntentForUser } from "./artifactUserText";
import type { ProjectState } from "../types/agentic";
import type { GeneratedPlan, PlanForm, ProjectType } from "../types/plan";

export type DocLang = "sr" | "en" | "ru";

export interface ProjectDocContext {
  lang: DocLang;
  projectType: ProjectType;
  projectTitle: string;
  taskKeys: string[];
  taskLabels: string[];
  location: string;
  sizeM2: string;
  stageLabel: string;
  userProfile: string;
  infrastructure: string;
}

export interface ProjectDocument {
  id: string;
  title: string;
  description: string;
  body: string;
  filename: string;
  /** Predmer: redovi za Word tabelu (kolone: grupa, stavka, jedinica, količina, napomena). */
  boqTable?: { headers: string[]; rows: string[][] };
}

const RENO_COSMETIC_ONLY = new Set(["flooring", "bathreno", "winreplace"]);
const INTERIOR_COSMETIC = new Set(["furniture", "kitchen", "bathequip", "lighting", "decor"]);
const RENO_STRUCTURAL = new Set(["ufh", "electrical", "plumbing", "insulation", "fullreno"]);

export function shouldIncludeNoPermitStatement(form: PlanForm): boolean {
  const pt = form.projectType;
  if (!pt || form.tasks.length === 0) return false;
  if (pt === "newbuild" || pt === "extension" || pt === "yard") return false;

  if (pt === "reno") {
    if (form.tasks.includes("fullreno")) return false;
    if (form.tasks.some((k) => RENO_STRUCTURAL.has(k))) return false;
    return form.tasks.every((k) => RENO_COSMETIC_ONLY.has(k));
  }

  if (pt === "interior") {
    return form.tasks.every((k) => INTERIOR_COSMETIC.has(k));
  }

  return false;
}

const T = {
  boq: {
    sr: { title: "Predmer radova (okvirno)", desc: "Stavke prilagođene izabranim radovima i kvadraturi — za dopunu količina i cena." },
    en: { title: "Bill of quantities (outline)", desc: "Line items tailored to your selected works and size — add quantities and unit prices." },
    ru: { title: "Предмер работ (черновик)", desc: "Позиции по выбранным работам и площади — дополните объёмы и цены." },
  },
  rfq: {
    sr: { title: "Zahtev za ponudu", desc: "Tekst za slanje izvođačima sa opisom opsega iz vašeg plana." },
    en: { title: "Request for quote", desc: "Text you can send to contractors describing the scope from your plan." },
    ru: { title: "Запрос коммерческого предложения", desc: "Текст для подрядчиков с описанием объёма по вашему плану." },
  },
  wp: {
    sr: { title: "Plan radova", desc: "Faze i koraci usklađeni sa tipom projekta i trenutnom etapom." },
    en: { title: "Work plan", desc: "Phases and steps aligned with your project type and current stage." },
    ru: { title: "План работ", desc: "Этапы и шаги с учётом типа проекта и текущей стадии." },
  },
  contract: {
    sr: { title: "Ugovor o izvođenju radova (nacrt)", desc: "Nacrt sa popunjenim opisom posla, lokacijom i predmetom; ostaje za dopunu sa izvođačem." },
    en: { title: "Works contract (draft)", desc: "Draft with project description and location filled in; complete with your contractor." },
    ru: { title: "Договор подряда (проект)", desc: "Черновик с описанием и адресом; заполните с подрядчиком." },
  },
  nopermit: {
    sr: { title: "Izjava o radovima bez građevinske dozvole (informativno)", desc: "Za manje invazivne radove; proverite u svojoj opštini pre početka." },
    en: { title: "Statement on works not requiring a building permit (informative)", desc: "For low-impact works; confirm with your municipality before starting." },
    ru: { title: "Справка о работах без разрешения (информационно)", desc: "Для небольших работ; уточните в местной управе." },
  },
  agentPrep: {
    sr: {
      title: "Pregled pripreme (kontekst planera)",
      desc: "Tekstualni izlaz pripremnih koraka, ugovor i predmer su iznad/ispod — ovo pomaže prenosu u ponude i dopunu podataka.",
    },
    en: {
      title: "Planner prep snapshot (agent context)",
      desc: "Text snapshot of the prep step; your RFQ, BoQ, and work plan are separate files above/below — this carries scope context into quotes.",
    },
    ru: {
      title: "Снимок подготовки (контекст планировщика)",
      desc: "Текстовый снимок шага подготовки; остальные документы рядом — для передачи в смету и доработку деталей.",
    },
  },
} as const;

function getAgentProjectState(form: PlanForm): ProjectState | null {
  const d = form.details;
  if (!d || typeof d !== "object" || !("agentProjectState" in d)) return null;
  const s = (d as { agentProjectState?: ProjectState }).agentProjectState;
  if (!s?.artifacts?.length) return null;
  return s;
}

function buildBodyAgentPrep(ctx: ProjectDocContext, state: ProjectState): string {
  const L = (m: Record<DocLang, string>) => m[ctx.lang];
  const lines: string[] = [
    L({
      sr: "Kontekst iz planerskog unosa (pripremne kartice)",
      en: "Planner intake context (prep cards)",
      ru: "Контекст планировщика (карточки подготовки)",
    }),
    "",
  ];
  if (state.goal) lines.push(L({ sr: "Cilj:", en: "Goal:", ru: "Цель:" }) + " " + state.goal);
  if (state.intent) {
    lines.push(
      L({ sr: "Fokus projekta:", en: "Project focus:", ru: "Фокус проекта:" }) +
        " " +
        humanizeIntentForUser(ctx.lang, state.intent),
    );
  }
  if (state.location) {
    lines.push(L({ sr: "Lokacija:", en: "Location:", ru: "Адрес:" }) + " " + state.location);
  }
  const muni = state.knownFacts.municipalityHint;
  if (muni && typeof muni.value === "string") {
    lines.push(
      L({
        sr: "Prepoznata opština (heuristika, nije adresa):",
        en: "Parsed municipality (heuristic, not a full address):",
        ru: "Распознанная општина (эвристика, не полный адрес):",
      }) + " " + muni.value,
    );
  }
  lines.push("");
  for (const a of state.artifacts) {
    lines.push("— " + a.title + " [" + a.status + "]");
    lines.push(
      a.content
        .split("\n")
        .map((line) => "  " + line)
        .join("\n"),
    );
    if (a.assumptions.length) {
      lines.push(
        "  " +
          L({ sr: "Napomene:", en: "Notes:", ru: "Примечания:" }) +
          " " +
          a.assumptions.join(" "),
      );
    }
    lines.push("");
  }
  if (state.openQuestions.length) {
    lines.push(
      L({
        sr: "Otvorene dopune (sa rezultata):",
        en: "Open follow-ups (from results):",
        ru: "Нерешённые уточнения (с экрана результата):",
      }),
    );
    for (const q of state.openQuestions) {
      lines.push("• " + q);
    }
  }
  return lines.join("\n");
}

function boqLines(
  lang: DocLang,
  projectTypeLabel: string,
  taskKeys: string[],
  sizeM2: string,
): string[] {
  const sz = sizeM2 || "—";
  const lines: string[] = [];
  const L = (m: Record<DocLang, string[]>) => m[lang];

  const add = (items: string[]) => {
    lines.push(...items);
  };

  const commonHeader = L({
    sr: [`Površina objekta / zone (m²): ${sz}`, `Tip projekta: ${projectTypeLabel}`, ""],
    en: [`Building / zone area (m²): ${sz}`, `Project type: ${projectTypeLabel}`, ""],
    ru: [`Площадь объекта / зоны (м²): ${sz}`, `Тип проекта: ${projectTypeLabel}`, ""],
  });
  add(commonHeader);

  const perTask: Record<string, Record<DocLang, string[]>> = {
    ufh: {
      sr: ["Podno grejanje:", "  • Demontaža / priprema postojećeg poda (m²)", "  • Termoizolaciona podloga (m²)", "  • Cevi / kablovi toplog poda (pogonska dužina)", "  • Razdelnici, aktuatori, soba termostat (kom)", "  • Estrih / anhidrit (m²)", "  • Ispitivanje pritiska i predaja protokola"],
      en: ["Underfloor heating:", "  • Strip / prepare existing floor (m²)", "  • Insulation boards (m²)", "  • UFH pipe / cable circuits (run length)", "  • Manifolds, actuators, room stats (pcs)", "  • Sreed / anhydrite pour (m²)", "  • Pressure test and handover report"],
      ru: ["Тёплый пол:", "  • Демонтаж / подготовка основания (м²)", "  • Теплоизоляция (м²)", "  • Трубы / кабель контура (п. м)", "  • Коллекторы, клапаны, термостаты (шт.)", "  • Стяжка (м²)", "  • Опрессовка и акт"],
    },
    winreplace: {
      sr: ["Zamena prozora / vrata:", "  • Demontaža postojećih jedinica (kom)", "  • Novi PVC / drvo / AL stolarija (kom)", "  • Pena, trake, solbanski pragovi", "  • Unutrašnji i spoljašnji okovi"],
      en: ["Windows / doors replacement:", "  • Remove existing units (pcs)", "  • New PVC / timber / aluminium (pcs)", "  • Foam, tapes, sill details", "  • Internal and external trims"],
      ru: ["Замена окон / дверей:", "  • Демонтаж (шт.)", "  • Новые блоки (шт.)", "  • Пена, ленты, отливы", "  • Откосы внутри и снаружи"],
    },
    flooring: {
      sr: ["Podne obloge:", "  • Priprema podloge, nivelacija (m²)", "  • Podloga / podmetač (m²)", "  • Završna obloga: keramika / parket / laminat (m²)", "  • Lajsne, profili, silikon"],
      en: ["Flooring:", "  • Subfloor prep and levelling (m²)", "  • Underlay (m²)", "  • Finish: tiles / parquet / laminate (m²)", "  • Skirting, profiles, sealant"],
      ru: ["Напольные покрытия:", "  • Подготовка основания (м²)", "  • Подложка (м²)", "  • Чистовое покрытие (м²)", "  • Плинтуса, профили"],
    },
    bathreno: {
      sr: ["Renovacija kupatila:", "  • Demontaža pločica i saniteta", "  • Hidroizolacija (m²)", "  • Novi pločice zid + pod (m²)", "  • Sanitarije i armature (komplet)", "  • Staklo / tuš kabina"],
      en: ["Bathroom renovation:", "  • Strip tiles and sanitaryware", "  • Waterproofing (m²)", "  • New wall and floor tiling (m²)", "  • Sanitaryware and brassware (set)", "  • Screen / enclosure"],
      ru: ["Ремонт санузла:", "  • Демонтаж плитки и сантехники", "  • Гидроизоляция (м²)", "  • Новая плитка (м²)", "  • Сантехника и смесители", "  • Перегородка / душевая"],
    },
    electrical: {
      sr: ["Elektroinstalacije:", "  • Demontaža zastarelih krugova", "  • Novi razvod kablova (procena m)", "  • Utičnice, prekidači, razvodna tabla", "  • Testiranje i prijava"],
      en: ["Electrical:", "  • Strip obsolete circuits", "  • New cable runs (estimate m)", "  • Sockets, switches, distribution board", "  • Testing and certification"],
      ru: ["Электрика:", "  • Демонтаж старых линий", "  • Новая проводка (оценка м)", "  • Розетки, выключатели, щит", "  • Испытания"],
    },
    plumbing: {
      sr: ["Vodoinstalacije:", "  • Demontaža cevi", "  • Novi razvod hladne / tople vode i kanalizacije", "  • Test hidrauličkog pritiska"],
      en: ["Plumbing:", "  • Strip-out", "  • New hot / cold / waste runs", "  • Pressure test"],
      ru: ["Водопровод / канализация:", "  • Демонтаж", "  • Новые трубопроводы", "  • Испытание"],
    },
    insulation: {
      sr: ["Izolacija:", "  • Priprema podloge fasade / krova (m²)", "  • Termo ploče / vuna (m²)", "  • OSB / mreža / završni sloj"],
      en: ["Insulation:", "  • Prepare substrate (m²)", "  • Boards / mineral wool (m²)", "  • Mesh and finish coat"],
      ru: ["Утепление:", "  • Подготовка (м²)", "  • Плиты / минвата (м²)", "  • Сетка и финиш"],
    },
    fullreno: {
      sr: ["Kompletno renoviranje (agregat):", "  • Demontaža i odvoz", "  • Grubi građevinski radovi", "  • Instalacije", "  • Glet, podovi, stolarija", "  • Krečenje, sanitarije, nameštaj"],
      en: ["Full renovation (aggregate):", "  • Strip-out and waste", "  • Structural / shell repairs", "  • MEP first and second fix", "  • Plaster, floors, joinery", "  • Decoration, sanitary, furnishing"],
      ru: ["Комплексный ремонт:", "  • Демонтаж и вывоз", "  • Черновые работы", "  • Инженерные сети", "  • Штукатурка, полы", "  • Отделка и сантехника"],
    },
    foundations: {
      sr: ["Temelji:", "  • Iskop i tesanje (m³)", "  • Beton i armatura", "  • Hidroizolacija"],
      en: ["Foundations:", "  • Excavation (m³)", "  • Concrete and reinforcement", "  • Waterproofing"],
      ru: ["Фундамент:", "  • Земляные работы (м³)", "  • Бетон и арматура", "  • Гидроизоляция"],
    },
    walls: {
      sr: ["Zidovi / konstrukcija:", "  • Zidanje / montaža (m²)", "  • Serklaži i ojačanja"],
      en: ["Walls / structure:", "  • Masonry / framing (m²)", "  • Ring beams and reinforcement"],
      ru: ["Стены:", "  • Кладка / каркас (м²)", "  • Пояса и усиление"],
    },
    roof: {
      sr: ["Krov:", "  • Konstrukcija krova", "  • Pokrivka, oluci, hidroizolacija"],
      en: ["Roof:", "  • Structure", "  • Covering, gutters, waterproofing"],
      ru: ["Кровля:", "  • Конструкция", "  • Покрытие и водосток"],
    },
    installations: {
      sr: ["Instalacije (grubi radovi):", "  • Elektro, VIK, grejanje — prvi radovi"],
      en: ["Installations (first fix):", "  • Electrical, plumbing, heating"],
      ru: ["Инженерные сети (черновые):", "  • Электрика, водопровод, отопление"],
    },
    finishing: {
      sr: ["Završni radovi:", "  • Gletovanje, podovi, vrata", "  • Krečenje"],
      en: ["Finishing:", "  • Plaster, floors, doors", "  • Decoration"],
      ru: ["Чистовая отделка:", "  • Штукатурка, полы, двери", "  • Покраска"],
    },
    fullbuild: {
      sr: ["Kompletan objekat (agregat):", "  • Sve faze od dozvole do predaje"],
      en: ["Full build (aggregate):", "  • All phases from permit to handover"],
      ru: ["Объект под ключ:", "  • Все этапы до сдачи"],
    },
    furniture: {
      sr: ["Nameštaj:", "  • Nabavka i montaža po prostorijama"],
      en: ["Furniture:", "  • Supply and installation by room"],
      ru: ["Мебель:", "  • Поставка и монтаж по комнатам"],
    },
    kitchen: {
      sr: ["Kuhinja:", "  • Elementi, radne ploče, ugradna tehnika"],
      en: ["Kitchen:", "  • Units, worktops, built-in appliances"],
      ru: ["Кухня:", "  • Шкафы, столешницы, техника"],
    },
    bathequip: {
      sr: ["Kupatilska oprema:", "  • Sanitarije, ogledala, pribor"],
      en: ["Bathroom equipment:", "  • Sanitaryware, mirrors, accessories"],
      ru: ["Сантехника:", "  • Приборы, зеркала"],
    },
    lighting: {
      sr: ["Osvetljenje:", "  • Tačke rasvete, ugradna i zidna", "  • U saradnji sa električarom"],
      en: ["Lighting:", "  • Lighting points, fittings", "  • Coordinated with electrician"],
      ru: ["Освещение:", "  • Точки и светильники", "  • С электриком"],
    },
    decor: {
      sr: ["Dekoracija:", "  • Zavese, tapete, dekorativni paneli"],
      en: ["Decoration:", "  • Curtains, wall finishes, panels"],
      ru: ["Декор:", "  • Шторы, отделка стен"],
    },
    leveling: {
      sr: ["Nivelisanje terena:", "  • Mašinski radovi, nasip, drenaža"],
      en: ["Ground levelling:", "  • Earthworks, fill, drainage"],
      ru: ["Планировка участка:", "  • Земляные работы, дренаж"],
    },
    lawn: {
      sr: ["Travnjak:", "  • Priprema tla, setva / busen"],
      en: ["Lawn:", "  • Soil prep, seed / turf"],
      ru: ["Газон:", "  • Подготовка, посев / рулон"],
    },
    irrigation: {
      sr: ["Navodnjavanje:", "  • Cevi, kapi / sprinkleri, automatika"],
      en: ["Irrigation:", "  • Piping, drip / sprinklers, controller"],
      ru: ["Полив:", "  • Трубы, капля / дождевание"],
    },
    fence: {
      sr: ["Ograda:", "  • Stubovi, paneli, kapija"],
      en: ["Fence:", "  • Posts, panels, gate"],
      ru: ["Забор:", "  • Столбы, секции"],
    },
    gate: {
      sr: ["Kapija:", "  • Montaža, motor (opciono)"],
      en: ["Gate:", "  • Installation, motor (optional)"],
      ru: ["Ворота:", "  • Монтаж, привод"],
    },
    paths: {
      sr: ["Staze / popločavanje:", "  • Nasip, ivičnjaci, ploče"],
      en: ["Paths / paving:", "  • Sub-base, edging, flags"],
      ru: ["Дорожки:", "  • Основание, бордюры, плитка"],
    },
    outdoorlight: {
      sr: ["Spoljašnje osvetljenje:", "  • Kablovi, stubovi, svetiljke"],
      en: ["Outdoor lighting:", "  • Cables, bollards, fittings"],
      ru: ["Уличный свет:", "  • Кабели, светильники"],
    },
  };

  const seen = new Set<string>();
  for (const k of taskKeys) {
    if (seen.has(k)) continue;
    const block = perTask[k];
    if (block) {
      add([`── ${k} ──`, ...block[lang], ""]);
      seen.add(k);
    }
  }

  if (lines.length <= 4) {
    add(
      L({
        sr: ["Opšte stavke:", "  • Pripremni radovi", "  • Zaštita postojećeg", "  • Čišćenje gradilišta"],
        en: ["General items:", "  • Preliminaries", "  • Protection of existing", "  • Site clean-up"],
        ru: ["Общие позиции:", "  • Подготовка", "  • Защита существующего", "  • Уборка"],
      }),
    );
  }

  add(
    L({
      sr: ["Napomena: dopuniti količine (m, m², m³, kom) i jedinične cene po izvođaču."],
      en: ["Note: add quantities (m, m², m³, pcs) and unit rates from each contractor."],
      ru: ["Примечание: укажите объёмы и цены по смете подрядчика."],
    }),
  );

  return lines;
}

function parseBoqLinesToTable(
  lines: string[],
  lang: DocLang,
): { headers: string[]; rows: string[][] } {
  const headers =
    lang === "sr"
      ? ["Grupa", "Stavka", "Jed.", "Kol.", "Nap."]
      : lang === "en"
        ? ["Group", "Item", "Unit", "Qty", "Notes"]
        : ["Группа", "Позиция", "Ед.", "Кол.", "Примеч."];

  const rows: string[][] = [];
  let group = "";
  let inSection = false;
  for (const line of lines) {
    const t = line.trim();
    if (/^──\s/.test(t)) {
      inSection = true;
      continue;
    }
    if (!inSection) continue;
    if (
      t.startsWith("Napomena") ||
      t.startsWith("Note:") ||
      t.startsWith("Примечание")
    )
      break;
    if (line.startsWith("  •")) {
      rows.push([
        group,
        line.replace(/^\s*•\s*/, "").trim(),
        "",
        "",
        "",
      ]);
    } else if (t && !line.startsWith("  ") && !t.startsWith("──")) {
      group = t.replace(/:\s*$/, "");
    }
  }
  return { headers, rows };
}

/** Redovi tabele za DOCX predmera (isti izvor kao tekstualni predmer). */
export function buildBoqTableData(ctx: ProjectDocContext): {
  headers: string[];
  rows: string[][];
} {
  const rawLines = boqLines(
    ctx.lang,
    ctx.projectTitle,
    ctx.taskKeys,
    ctx.sizeM2,
  );
  return parseBoqLinesToTable(rawLines, ctx.lang);
}

function buildBodyBoq(ctx: ProjectDocContext): string {
  const h = {
    sr: "PREDMER RADOVA",
    en: "BILL OF QUANTITIES (OUTLINE)",
    ru: "ПРЕДМЕР РАБОТ (ЧЕРНОВИК)",
  }[ctx.lang];
  const lines = [
    h,
    "═".repeat(Math.min(h.length + 4, 48)),
    "",
    `${ctx.projectTitle}`,
    ctx.location ? `${ctx.lang === "sr" ? "Lokacija" : ctx.lang === "en" ? "Location" : "Адрес"}: ${ctx.location}` : "",
    `${ctx.lang === "sr" ? "Etapa" : ctx.lang === "en" ? "Stage" : "Этап"}: ${ctx.stageLabel}`,
    `${ctx.lang === "sr" ? "Investitor / profil" : ctx.lang === "en" ? "Client profile" : "Заказчик"}: ${ctx.userProfile}`,
    `${ctx.lang === "sr" ? "Infrastruktura" : ctx.lang === "en" ? "Infrastructure" : "Коммуникации"}: ${ctx.infrastructure}`,
    "",
    ...boqLines(ctx.lang, ctx.projectTitle, ctx.taskKeys, ctx.sizeM2),
  ];
  return lines.filter(Boolean).join("\n");
}

function buildBodyRfq(ctx: ProjectDocContext): string {
  const L = (s: Record<DocLang, string>) => s[ctx.lang];
  const scope = ctx.taskLabels.length ? ctx.taskLabels.join(", ") : L({ sr: "(nije navedeno)", en: "(not specified)", ru: "(не указано)" });
  const intro = L({
    sr: `Poštovani,\n\nMolimo vas za ponudu za sledeći opseg radova:`,
    en: `Dear Sir/Madam,\n\nPlease submit a quote for the following scope of works:`,
    ru: `Уважаемые коллеги,\n\nПросим коммерческое предложение по следующему объёму:`,
  });
  const bullets = [
    L({ sr: "Tip projekta", en: "Project type", ru: "Тип проекта" }) + `: ${ctx.projectTitle}`,
    L({ sr: "Lokacija", en: "Location", ru: "Адрес" }) + `: ${ctx.location || "—"}`,
    L({ sr: "Površina (m²)", en: "Area (m²)", ru: "Площадь (м²)" }) + `: ${ctx.sizeM2 || "—"}`,
    L({ sr: "Opis radova", en: "Work description", ru: "Описание работ" }) + `: ${scope}`,
    L({ sr: "Trenutna faza", en: "Current stage", ru: "Текущий этап" }) + `: ${ctx.stageLabel}`,
    L({ sr: "Priključci", en: "Utilities", ru: "Коммуникации" }) + `: ${ctx.infrastructure}`,
  ];
  const outro = L({
    sr: "\nMolimo razdvojenu ponudu po pozicijama, rok izvršenja i uslove plaćanja.\nSrdačan pozdrav,",
    en: "\nPlease provide an itemised quote, programme and payment terms.\nKind regards,",
    ru: "\nПросим детализированную смету, сроки и условия оплаты.\nС уважением,",
  });
  return [intro, "", bullets.map((b) => `• ${b}`).join("\n"), outro].join("\n");
}

function buildBodyWorkPlan(ctx: ProjectDocContext, plan: GeneratedPlan): string {
  const L = (s: Record<DocLang, string>) => s[ctx.lang];
  const title = L({ sr: "PLAN RADOVA", en: "WORK PLAN", ru: "ПЛАН РАБОТ" });
  const pre: string[] = [
    title,
    "═".repeat(title.length),
    "",
    `${L({ sr: "Tip projekta", en: "Project type", ru: "Тип проекта" })}: ${ctx.projectTitle}`,
    `${L({ sr: "Lokacija", en: "Location", ru: "Адрес" })}: ${ctx.location || "—"}`,
    `${L({ sr: "Površina (m²)", en: "Area (m²)", ru: "Площадь (м²)" })}: ${ctx.sizeM2 || "—"}`,
    "",
  ];

  if (ctx.projectType === "newbuild") {
    pre.push(
      L({
        sr: "Faze specifične za novu gradnju:",
        en: "Typical phases for a new build:",
        ru: "Этапы нового строительства:",
      }),
    );
    pre.push(
      L({
        sr: "  1. Idejni i glavni projekat, građevinska dozvola",
        en: "  1. Design package and building permit",
        ru: "  1. Проект и разрешение на строительство",
      }),
    );
    pre.push(
      L({
        sr: "  2. Priprema gradilišta i temelji",
        en: "  2. Site setup and foundations",
        ru: "  2. Подготовка площадки и фундамент",
      }),
    );
    pre.push(
      L({
        sr: "  3. Noseća struktura, krov, fasada",
        en: "  3. Structure, roof, facade",
        ru: "  3. Каркас, кровля, фасад",
      }),
    );
    pre.push(
      L({
        sr: "  4. Instalacije — prvi radovi",
        en: "  4. MEP first fix",
        ru: "  4. Инженерные сети (черновые)",
      }),
    );
    pre.push(
      L({
        sr: "  5. Završni radovi i predaja",
        en: "  5. Finishing and handover",
        ru: "  5. Отделка и сдача",
      }),
    );
    pre.push("");
  } else if (ctx.projectType === "extension") {
    pre.push(
      L({
        sr: "Faze za nadogradnju / dogradnju:",
        en: "Phases for an extension:",
        ru: "Этапы пристройки / надстройки:",
      }),
    );
    pre.push(
      L({
        sr: "  • Statika postojećeg + projekat dogradnje, dozvole",
        en: "  • Existing structure review + extension design, permits",
        ru: "  • Обследование + проект пристройки, разрешения",
      }),
    );
    pre.push(
      L({
        sr: "  • Temelji nove oblasti, vezivanje na postojeće",
        en: "  • Foundations and tie-in to existing building",
        ru: "  • Фундамент и примыкание к дому",
      }),
    );
    pre.push(
      L({
        sr: "  • Zatvaranje krova, hidroizolacija, fasada",
        en: "  • Roof junctions, waterproofing, envelope",
        ru: "  • Узлы кровли, гидроизоляция",
      }),
    );
    pre.push("");
  } else if (ctx.projectType === "interior") {
    pre.push(
      L({
        sr: "Fokus enterijera — koordinisati sa izabranim stavkama:",
        en: "Interior focus — coordinate with your selected items:",
        ru: "Интерьер — по выбранным позициям:",
      }),
    );
    pre.push(`  • ${ctx.taskLabels.join(", ") || "—"}`);
    pre.push(
      L({
        sr: "  • Redosled: grubo → instalacije → krečenje → nameštaj / rasveta",
        en: "  • Sequence: rough → services → decoration → furniture / lighting",
        ru: "  • Порядок: чистовая разводка → отделка → мебель / свет",
      }),
    );
    pre.push("");
  } else if (ctx.projectType === "yard") {
    pre.push(
      L({
        sr: "Spoljni radovi — uskladiti sa izabranim stavkama i granicom parcele:",
        en: "Outdoor works — align with selected items and plot boundary:",
        ru: "Наружные работы — по выбранным позициям и границам участка:",
      }),
    );
    pre.push(`  • ${ctx.taskLabels.join(", ") || "—"}`);
    pre.push("");
  } else if (ctx.projectType === "reno") {
    const hasUfh = ctx.taskKeys.includes("ufh");
    const labels = ctx.taskLabels.join(", ");
    pre.push(
      L({
        sr: "Opseg renoviranja (iz planera):",
        en: "Renovation scope (from planner):",
        ru: "Объём ремонта (из планировщика):",
      }),
    );
    pre.push(`  • ${labels || "—"}`);
    if (hasUfh) {
      pre.push(
        L({
          sr: "  • Podno grejanje: uskladiti sa elektro i estrihom; hidrauličko ispitivanje pre završnog poda.",
          en: "  • Underfloor heating: coordinate with electrics and screed; pressure test before final flooring.",
          ru: "  • Тёплый пол: согласовать с электрикой и стяжкой; опрессовка до чистового пола.",
        }),
      );
    }
    pre.push("");
  }

  pre.push(L({ sr: "Koraci iz generisanog plana:", en: "Steps from your generated plan:", ru: "Шаги из сгенерированного плана:" }));
  plan.steps.forEach((s, i) => {
    pre.push(`${i + 1}. ${s.step}`);
  });

  pre.push("");
  pre.push(
    L({
      sr: `Trenutna etapa projekta: ${ctx.stageLabel}`,
      en: `Current project stage: ${ctx.stageLabel}`,
      ru: `Текущая стадия: ${ctx.stageLabel}`,
    }),
  );
  return pre.filter(Boolean).join("\n");
}

function buildBodyContract(ctx: ProjectDocContext): string {
  const L = (s: Record<DocLang, string>) => s[ctx.lang];
  const work = ctx.taskLabels.length ? ctx.taskLabels.join(", ") : L({ sr: "radovi po dogovoru", en: "works as agreed", ru: "работы по согласованию" });
  return [
    L({ sr: "UGOVOR O IZVOĐENJU GRADEVINSKIH RADOVA (NACRT)", en: "CONSTRUCTION WORKS AGREEMENT (DRAFT)", ru: "ДОГОВОР ПОДРЯДА (ПРОЕКТ)" }),
    "",
    L({ sr: "Predmet ugovora (auto-popunjeno):", en: "Subject (auto-filled):", ru: "Предмет (заполнено автоматически):" }),
    `  ${ctx.projectTitle}`,
    "",
    L({ sr: "Lokacija izvršenja:", en: "Site / location:", ru: "Адрес / объект:" }),
    `  ${ctx.location || "_____________________________"}`,
    "",
    L({ sr: "Opis radova:", en: "Description of works:", ru: "Описание работ:" }),
    `  ${work}`,
    "",
    L({ sr: "Površina (orientaciono):", en: "Approximate area:", ru: "Площадь (ориентир):" }),
    `  ${ctx.sizeM2 || "—"} m²`,
    "",
    L({ sr: "Strane (za ručno dopunu):", en: "Parties (complete manually):", ru: "Стороны (вручную):" }),
    `  ${L({ sr: "Investitor:", en: "Client:", ru: "Заказчик:" })} _____________________________`,
    `  ${L({ sr: "Izvođač:", en: "Contractor:", ru: "Подрядчик:" })} _____________________________`,
    "",
    L({ sr: "Cena i dinamika plaćanja:", en: "Price and payment schedule:", ru: "Цена и график платежей:" }),
    "  _____________________________",
    "",
    L({ sr: "Potpisi:", en: "Signatures:", ru: "Подписи:" }),
    "  _____________________________",
    "",
    L({
      sr: "Napomena: ovaj nacrt nije pravni savet. Overite kod advokata pre potpisivanja.",
      en: "Note: not legal advice. Have a solicitor review before signing.",
      ru: "Примечание: не юридическая консультация. Покажите юристу перед подписанием.",
    }),
  ].join("\n");
}

function buildBodyNoPermit(ctx: ProjectDocContext): string {
  const L = (s: Record<DocLang, string>) => s[ctx.lang];
  const scope = ctx.taskLabels.join(", ");
  return [
    L({
      sr: "INFORMATIVNA IZJAVA — RADOVI BEZ GRAĐEVINSKE DOZVOLE (MOGUĆI SLUČAJ)",
      en: "INFORMATIVE STATEMENT — WORKS POSSIBLY NOT REQUIRING A BUILDING PERMIT",
      ru: "ИНФОРМАЦИЯ — РАБОТЫ БЕЗ РАЗРЕШЕНИЯ (ВОЗМОЖНЫЙ СЛУЧАЙ)",
    }),
    "",
    L({
      sr: "VAŽNO: Zakonski uslovi zavise od opštine i konkretnog stanja objekta. Uvek potvrdite u nadležnoj građevinskoj inspekciji / opštini pre početka radova.",
      en: "IMPORTANT: Legal requirements depend on your municipality and the property. Always confirm with the local building authority before starting.",
      ru: "ВАЖНО: Требования зависят от общины и объекта. Уточните в управе до начала работ.",
    }),
    "",
    L({ sr: "Predmet (iz planera):", en: "Subject (from planner):", ru: "Предмет (из планировщика):" }),
    `  ${ctx.projectTitle}`,
    L({ sr: "Lokacija:", en: "Location:", ru: "Адрес:" }) + ` ${ctx.location || "—"}`,
    L({ sr: "Površina (m²):", en: "Area (m²):", ru: "Площадь (м²):" }) + ` ${ctx.sizeM2 || "—"}`,
    L({ sr: "Opis radova:", en: "Works:", ru: "Работы:" }) + ` ${scope}`,
    "",
    L({
      sr: "Ovaj obrazac možete priložiti kao prilog uz upit opštini. Ne zamenjuje rešenje nadležnog organa.",
      en: "You may attach this as an enclosure to a municipal enquiry. It does not replace an official decision.",
      ru: "Можно приложить к запросу в управу. Не заменяет официальное решение.",
    }),
  ].join("\n");
}

export function generateProjectDocuments(
  form: PlanForm,
  plan: GeneratedPlan,
  ctx: ProjectDocContext,
): ProjectDocument[] {
  const lang = ctx.lang;
  const docs: ProjectDocument[] = [
    {
      id: "boq",
      title: T.boq[lang].title,
      description: T.boq[lang].desc,
      body: buildBodyBoq(ctx),
      boqTable: buildBoqTableData(ctx),
      filename: lang === "en" ? `bill-of-quantities-${ctx.projectType}.txt` : lang === "ru" ? `predmer-${ctx.projectType}.txt` : `predmer-${ctx.projectType}.txt`,
    },
    {
      id: "rfq",
      title: T.rfq[lang].title,
      description: T.rfq[lang].desc,
      body: buildBodyRfq(ctx),
      filename: lang === "en" ? "request-for-quote.txt" : lang === "ru" ? "zapros-kp.txt" : "zahtev-ponuda.txt",
    },
    {
      id: "workplan",
      title: T.wp[lang].title,
      description: T.wp[lang].desc,
      body: buildBodyWorkPlan(ctx, plan),
      filename: lang === "en" ? "work-plan.txt" : lang === "ru" ? "plan-rabot.txt" : "plan-radova.txt",
    },
    {
      id: "contract",
      title: T.contract[lang].title,
      description: T.contract[lang].desc,
      body: buildBodyContract(ctx),
      filename: lang === "en" ? "works-contract-draft.txt" : lang === "ru" ? "dogovor-proekt.txt" : "ugovor-nacrt.txt",
    },
  ];

  if (shouldIncludeNoPermitStatement(form)) {
    docs.push({
      id: "nopermit",
      title: T.nopermit[lang].title,
      description: T.nopermit[lang].desc,
      body: buildBodyNoPermit(ctx),
      filename:
        lang === "en"
          ? "no-permit-statement-informative.txt"
          : lang === "ru"
            ? "spravka-bez-razresheniya.txt"
            : "izjava-bez-dozvole-informativno.txt",
    });
  }

  const agentState = getAgentProjectState(form);
  if (agentState) {
    docs.push({
      id: "agent-prep",
      title: T.agentPrep[lang].title,
      description: T.agentPrep[lang].desc,
      body: buildBodyAgentPrep(ctx, agentState),
      filename:
        lang === "en"
          ? "planner-agent-context.txt"
          : lang === "ru"
            ? "kontekst-planirovshchika.txt"
            : "pripremni-kontekst-planer.txt",
    });
  }

  return docs;
}
