import type { Lang } from "../translations";
import type { ProjectType } from "../types/plan";
import { FULL_RENOVATION_TASK_KEY } from "../constants/renovation";

const RE_LEGAL = /legaliz|nelegali|nije\s+leg|nedovoljno\s+leg|kalkulac|status\s*objekta/i;
const RE_EXT = /nadograd|dograd|prizem|dodat|dostav|prošir|krov\s*nad|sprat|aneks|nadstreš/i;
const RE_RENO = /renovir|renov|komplet|adapt|enterijer|završn|kupat|podn|f\/as|grejanj/i;
const RE_HOUSE = /kuć|kuc|kuce|kuca|stamben|nekr|objekat|objekti|stan|kuće/i;
const RE_NUM = /(\d{1,3}(?:[.,]\d+)?)(?![^0-9]*%)/g;

export type ChatLine = { role: "user" | "assistant"; text: string };

export type FieldPatch = Record<string, string | number | boolean | string[] | null | undefined>;

export type PlannerAgentApply = {
  projectType: ProjectType;
  taskKeys: string[];
  reno?: FieldPatch;
  /** extension / newbuild / interior / yard: conditional detail fields */
  conditional?: FieldPatch;
  /** Always appended to project goal (for plan / orchestration) */
  goalAppend: string;
};

function extractNumbers(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(RE_NUM)) {
    const n = parseFloat(m[1].replace(",", "."));
    if (Number.isFinite(n) && n >= 5 && n <= 5000) out.push(n);
  }
  return out;
}

function detectScenario(g: string) {
  const t = g.toLowerCase();
  return {
    legal: RE_LEGAL.test(t),
    ext: RE_EXT.test(t),
    reno: RE_RENO.test(t) || /komplet/i.test(t),
    house: RE_HOUSE.test(t),
  };
}

const COPY: Record<
  Lang,
  {
    intro: string;
    followTemplate: (n: number) => string;
    askNumbers: string;
    applyExt: (main: number, add: number) => string;
    applyReno: (main: number) => string;
    generic: string;
  }
> = {
  sr: {
    intro:
      "Kratka orijentacija: kombinacija nelogovane kuće, nadogradnje i opširnog renoviranja retko je jedan jednostavan upit – zavisi od katastra, lokalne uprave, konstrukcije i toga da li se menjaju noseći elementi. Podela je smislena: (1) administrativno–pravni deo (katastar, status, legalizacija) i (2) projekat i izvođenje. Ovaj alat daje pripremu i reči, ne odluke – to ostaju arhitekta, statik, geodetski, građevinska inspekcija i advokat gde treba.",
    followTemplate: (n) => {
      const p = n === 1 ? "Jedan broj" : `Do ${n} broja`;
      return `${p} za kvadrature (m²) su dovoljni kao okvir.`;
    },
    askNumbers:
      "Ako ne znate oba broja, napišite samo približno postojeću kvadraturu (npr. oko 110) i nadogradnju u rečima. Sledeći koraci u planu i dalje mogu pojašniti detalje.",
    applyExt: (main, add) =>
      `Predlog za planer: tip Nadogradnja / dogradnja, okvir: postojeći ~${main} m², nadogradnja ~${add} m². To su okvire, ne inženjerska obrada.\nAko vam unutra završni radovi znače ceo objekat, nakon ove faze (ili nakon nacrta) možete u istom planu dodati i „Renoviranje“ ili dodatne zadatke ako ste izabrali širu putanju (ovde smo podesili nadogradnju kao fokus).`,
    applyReno: (main) =>
      `Predlog: tip Renoviranje sa stavkom „Kompletno renoviranje (ceo objekat)“ i približno ~${main} m². Proverite i dalje dozvole ako radovi uključuju konstrukciju ili fasade pod posebnom kontrolom.`,
    generic:
      "Hvala. U narednim koracima uvek birate tip i zadatke u formi; ovaj panel služi da vam pitanja budu u kontekstu (šta pripremiti, šta pitani struku).",
  },
  en: {
    intro:
      "A quick note: a non–fully compliant house plus an extension plus a big renovation is rarely a single, linear case. It depends on cadastre, municipality, structure, and utilities. Think in two tracks: (1) legal/admin (status, any legalization) and (2) the build/delivery. This app helps you prepare; it does not replace a licensed team.",
    followTemplate: (n) => (n === 1 ? "One" : `Up to ${n}`) + " m² value(s) as ballparks are enough.",
    askNumbers:
      "If you only know the existing footprint, write that, and describe the new part in words. You can refine in the next steps.",
    applyExt: (main, add) =>
      `Suggested: Extension project type, existing ~${main} m², new build / extension ~${add} m² (indicative). You can still add reno / interior work later in the same flow if the product types allow it.`,
    applyReno: (main) =>
      `Suggestion: Renovation with the “full reno of the property” path and ~${main} m². Verify permits for anything structural or envelope-critical.`,
    generic: "Thanks. The structured steps still capture the legal minimum for our estimates; this chat is context for you, not a second form in disguise.",
  },
  ru: {
    intro:
      "Кратко: нелегальный/неполный статус + надстройка + крупный ремонт — это обычно не один запрос, а пакет вопросов (кадастр, госорган, несущие конструкции, коммуникации). Подготовка в приложении — ориентир, не «решение в канцелярии» и не замена проекту/юристу.",
    followTemplate: (n) => (n === 1 ? "Одно число" : `До ${n} чисел`) + " m² (ориентир) достаточно.",
    askNumbers: "Можно одно число и второе описать словами — уточнение будет дальше по шагам.",
    applyExt: (main, add) =>
      `Предложение: тип «надстройка/дозаг», сущ. ~${main} м², строй-надбавка ~${add} м² (оценка). Можно потом уточнить отделку/инженерку другими шагами.`,
    applyReno: (main) =>
      `Предложение: «Ремонт» + полный рем. около ~${main} м². Статик/согласования — вне этого окна.`,
    generic: "Спасибо. Ниже по шагам остаётся структурированный план: чат — контекст, не дублирование всей формы.",
  },
};

function buildFirstReply(combined: string, lang: Lang): string {
  const c = COPY[lang];
  const s = detectScenario(combined);
  const lines: string[] = [];
  if (s.legal) {
    lines.push(
      (lang === "sr"
        ? "Legalizacija: put zavisi od perioda, zone i toga u kom ste postupku. Potrebni su aktuelni podaci iz katastra, često uporedo geodetski zapis i projekt, ponekad i parnični/UP postupak. eUprava, lokalna opština i sekcija Dokumenti ovde su polazne tačke, ne odluke."
        : lang === "ru"
          ? "Легализация: путь сильно зависит от сроков, зон и ведомства. Нужен свежий кадастр, проект, инженер, иногда адвокат. eUprava / opština / наши чек-листы — ориентир, не окончательно."
          : "Legalization is highly case-specific: cadastre status, any ongoing procedures, and whether you must regularize or rebuild. Use eUprava, the municipality, and the Documents area here as a starting list."),
    );
  }
  if (s.ext) {
    lines.push(
      (lang === "sr"
        ? "Nadogradnja: obično zahteva proračun statike, priključke i, kada je potrebno, glavni projekat. U planeru to tipom „Nadogradnja / dogradnja” sa fazama: temelj, konstrukcija, krov, instalacije, završni radovi gde to izaberete."
        : "Extensions usually need structural checks, utilities, and often formal design. The planner’s Extension type groups those work streams."),
    );
  }
  if (s.reno && s.house) {
    lines.push(
      (lang === "sr"
        ? "Renoviranje unutrašnjosti: u ovom alatu „kompletan remont (ceo objekat)” pomaže da značajna završna / instalacijska polja budu u okviru jednog pristupa, ali uvek uverite da se ne naruše noseći zidovi bez provere i dozvole."
        : "Interior/major reno: the app’s “full reno of the home” is a product shortcut, not a building permit. Structural changes are extra."),
    );
  }
  if (lines.length === 0) {
    return c.generic + "\n\n" + c.askNumbers;
  }
  return [c.intro, "", ...lines, "", c.followTemplate(2), "", c.askNumbers].join("\n");
}

function buildSecondReply(userText: string, goal: string, lang: Lang): { text: string; apply?: PlannerAgentApply } {
  const c = COPY[lang];
  const nums = extractNumbers(userText);
  const s = { ...detectScenario(goal + " " + userText) };
  const extTasks = ["foundations", "walls", "roof", "installations", "finishing", "fullbuild"] as const;

  if (nums.length >= 2 && s.ext) {
    const existing = Math.round(nums[0]);
    const newPart = Math.round(nums[1]);
    if (newPart > 0 && existing > 0) {
      return {
        text:
          c.applyExt(existing, newPart) +
          "\n\n" +
          (lang === "sr"
            ? "Ako ovo prati vaše brojeve (prvi = postojeći m², drugi = dogradnja m²), kliknite „Primeni u planer” ispod. Ako ste brojeve pomešali, napišite u novoj poruci dva ispravna broja u istom redosledu."
            : "We read the first number as existing m², the second as the new/added m². Use “Apply to planner” if that matches, or re-send the pair."),
        apply: {
          projectType: "extension",
          taskKeys: [...extTasks],
          conditional: {
            propertyType: "house",
            budgetBand: "mid",
            totalPropertyAreaM2: String(existing),
          },
          goalAppend: ` [Vođa: okvir postojeći ~${existing} m², nadogradnja ~${newPart} m². Status: proveri legalizaciju u upravi i katastru; pripremni opis, ne odluka.]`,
        },
      };
    }
  }

  if (nums.length >= 1 && s.reno && !s.ext) {
    const mainSize = Math.round(nums[0]);
    return {
      text: c.applyReno(mainSize) + "\n\n" + (lang === "sr" ? "Kliknite „Primeni u planer”." : "Use “Apply to planner” if it fits."),
      apply: {
        projectType: "reno",
        taskKeys: [FULL_RENOVATION_TASK_KEY],
        reno: {
          propertyType: "house",
          budgetBand: "mid",
          totalPropertyAreaM2: String(mainSize),
        },
        goalAppend: ` [Vođa: ~${mainSize} m², kompletni remont — provera dozvola za konstrukciju pri potrebi.]`,
      },
    };
  }

  return { text: c.generic + "\n\n" + c.askNumbers };
}

export function runLocalPlannerAgentTurn(
  goal: string,
  history: ChatLine[],
  userMessage: string,
  lang: Lang,
): { reply: string; apply?: PlannerAgentApply } {
  const userCount = history.filter((m) => m.role === "user").length;
  const combined = `${goal}\n${userMessage}`;

  if (userCount === 0) {
    return { reply: buildFirstReply(combined, lang) };
  }
  if (userCount === 1) {
    const r = buildSecondReply(userMessage, goal, lang);
    return { reply: r.text, apply: r.apply };
  }
  return { reply: COPY[lang].generic + "\n" + COPY[lang].askNumbers };
}
