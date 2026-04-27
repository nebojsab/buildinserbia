import { translations, type Lang } from "../translations";
import type { ProjectType } from "../types/plan";

/** Replaces internal intent slugs with short, user-facing copy. */
const INTENT_HUMAN: Record<Lang, Record<string, string>> = {
  sr: {
    new_house_planning: "Planiranje nove gradnje (kuća)",
    reno_with_windows: "Renoviranje, uključena zamena stolarije",
    renovation_planning: "Renoviranje postojećeg objekta",
    extension_planning: "Nadogradnja ili dogradnja",
    interior_project: "Enterijer i završna oprema",
    yard_project: "Dvorište i spoljašnje uređenje",
    general_planning: "Opšte planiranje projekta",
  },
  en: {
    new_house_planning: "New-build (house) planning",
    reno_with_windows: "Renovation with window & door replacement",
    renovation_planning: "Renovation of an existing property",
    extension_planning: "Extension or add-on work",
    interior_project: "Interior and finishing",
    yard_project: "Yard and outdoor work",
    general_planning: "General project planning",
  },
  ru: {
    new_house_planning: "Планирование нового строительства (дом)",
    reno_with_windows: "Ремонт с заменой окон/дверей",
    renovation_planning: "Ремонт существующего объекта",
    extension_planning: "Пристройка / надстройка",
    interior_project: "Интерьер и отделка",
    yard_project: "Двор и благоустройство",
    general_planning: "Общее планирование",
  },
};

const ORDERED_PROJECT_TYPES: ProjectType[] = [
  "newbuild",
  "reno",
  "extension",
  "interior",
  "yard",
];

export function taskKeyToUserLabel(lang: Lang, projectType: ProjectType | null, key: string): string {
  const t = translations[lang];
  const tasksByType = t.planner.tasks;
  const tryType = (pt: ProjectType | null): string | null => {
    if (!pt) return null;
    const list = tasksByType[pt];
    const found = list?.find((i) => i.k === key);
    return found?.label ?? null;
  };

  const primary = tryType(projectType);
  if (primary) return primary;

  for (const pt of ORDERED_PROJECT_TYPES) {
    const s = tryType(pt);
    if (s) return s;
  }
  return key;
}

export function formatTasksForUser(lang: Lang, projectType: ProjectType | null, taskKeys: string[]): string {
  if (taskKeys.length === 0) return "—";
  return taskKeys.map((k) => taskKeyToUserLabel(lang, projectType, k)).join(", ");
}

export function humanizeIntentForUser(lang: Lang, intent: string): string {
  return INTENT_HUMAN[lang][intent] ?? intent;
}
