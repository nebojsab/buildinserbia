import type { ContentLocale, LocalizedContentFields } from "./types";

type LocaleBundle = {
  title: string;
  body: string;
  excerpt: string;
  categories: string[];
};

function toFields(input: LocaleBundle): LocalizedContentFields {
  return {
    title: input.title,
    body: input.body,
    excerpt: input.excerpt,
    categories: [...input.categories],
  };
}

/** Distinct title/body/excerpt/categories per UI language (sr / en / ru). */
export function trilingual(bundle: {
  sr: LocaleBundle;
  en: LocaleBundle;
  ru: LocaleBundle;
}): Record<ContentLocale, LocalizedContentFields> {
  return {
    sr: toFields(bundle.sr),
    en: toFields(bundle.en),
    ru: toFields(bundle.ru),
  };
}
