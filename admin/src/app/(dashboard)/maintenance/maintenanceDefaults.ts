export type Lang = "sr" | "en" | "ru";

export type ButtonConfig = { label: string | null; url: string | null; enabled: boolean };

export type LangBlock = {
  heading: string | null;
  subTitle: string | null;
  body: string | null;
  countdownLabel: string | null;
  footerNote: string | null;
  primary: ButtonConfig;
  secondary: ButtonConfig;
};

export type MaintenanceLangs = Record<Lang, LangBlock>;

export const DEFAULT_LANGS: MaintenanceLangs = {
  sr: {
    heading: "BuildInSerbia uskoro stiže",
    subTitle: "Pripremamo mesto za lakše planiranje gradnje, renoviranja i troškova u Srbiji.",
    body: "BuildInSerbia će pomoći u boljem razumevanju troškova, faza radova i važnih koraka pre početka projekta.",
    countdownLabel: "Do lansiranja je ostalo",
    footerNote: "Za pitanja i dodatne informacije, pišite nam na hello@buildinserbia.com.",
    primary: { label: null, url: null, enabled: false },
    secondary: { label: null, url: null, enabled: false },
  },
  en: {
    heading: "BuildInSerbia is coming soon",
    subTitle: "We’re preparing a simpler way to plan construction, renovation, and project costs in Serbia.",
    body: "BuildInSerbia will help make project costs, work phases, and key pre-construction steps easier to understand.",
    countdownLabel: "Time remaining until launch",
    footerNote: "For questions and additional information, contact us at hello@buildinserbia.com.",
    primary: { label: null, url: null, enabled: false },
    secondary: { label: null, url: null, enabled: false },
  },
  ru: {
    heading: "BuildInSerbia скоро будет доступен",
    subTitle: "Мы готовим более простой способ планирования строительства, ремонта и расходов в Сербии.",
    body: "BuildInSerbia поможет лучше понять расходы, этапы работ и важные шаги перед началом проекта.",
    countdownLabel: "До запуска осталось",
    footerNote: "По вопросам и за дополнительной информацией, напишите нам на hello@buildinserbia.com.",
    primary: { label: null, url: null, enabled: false },
    secondary: { label: null, url: null, enabled: false },
  },
};

