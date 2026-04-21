import { calculateReadingTimeMinutes } from "./helpers";
import type { BaseContentItem, ContentLocale } from "./types";

export function normalizeLocale(input: string | null | undefined): ContentLocale {
  if (input === "en" || input === "ru" || input === "sr") return input;
  return "sr";
}

export function localeLabel(locale: ContentLocale): string {
  if (locale === "en") return "English";
  if (locale === "ru") return "Русский";
  return "Srpski";
}

export function localizeContentItem(item: BaseContentItem, locale: ContentLocale): BaseContentItem {
  const localized = item.locales[locale];
  const title = localized.title.trim() || item.title;
  const body = localized.body.trim() || item.body;
  const excerpt = localized.excerpt.trim() || item.excerpt;
  const categories =
    localized.categories.length > 0 ? localized.categories : item.categories;
  return {
    ...item,
    title,
    body,
    excerpt,
    categories,
    readingTime: calculateReadingTimeMinutes(body),
  };
}
