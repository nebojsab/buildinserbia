import type { BaseContentItem, ContentLocale, ContentSortOption } from "./types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripContentMarkup(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateExcerptFromBody(body: string, maxChars = 250): string {
  const plain = stripContentMarkup(body);
  if (plain.length <= maxChars) return plain;
  const trimmed = plain.slice(0, maxChars);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace < maxChars * 0.55) return `${trimmed.trimEnd()}...`;
  return `${trimmed.slice(0, lastSpace).trimEnd()}...`;
}

export function calculateReadingTimeMinutes(body: string, wordsPerMinute = 200): number {
  const plain = stripContentMarkup(body);
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatContentDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function sortContentItems<T extends BaseContentItem>(
  items: T[],
  sort: ContentSortOption,
): T[] {
  const next = [...items];
  switch (sort) {
    case "oldest":
      return next.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    case "shortest-read":
      return next.sort((a, b) => (a.readingTime ?? 0) - (b.readingTime ?? 0));
    case "longest-read":
      return next.sort((a, b) => (b.readingTime ?? 0) - (a.readingTime ?? 0));
    case "newest":
    default:
      return next.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
}

/** Plain text for search: strips HTML / markdown so words are not split by tags. */
function searchableText(raw: string | undefined | null): string {
  if (!raw) return "";
  return stripContentMarkup(raw);
}

function pushLocaleSearchChunks(chunks: string[], locale: ContentLocale, item: BaseContentItem) {
  const L = item.locales[locale];
  chunks.push(L.title, L.excerpt, ...L.categories, searchableText(L.body));
}

/**
 * Matches title, excerpt, author, slug, categories, and full post/document body text.
 * Body is searched after stripping markup (HTML from the editor, markdown) so phrases are not broken by tags.
 * All locales (sr/en/ru) are included so search works regardless of UI language or which locale holds the term.
 */
export function matchesContentSearch(item: BaseContentItem, query: string): boolean {
  const q = query.trim().toLowerCase().normalize("NFC");
  if (!q) return true;

  const chunks: string[] = [
    item.title,
    item.excerpt,
    item.author,
    item.slug,
    ...item.categories,
    searchableText(item.body),
  ];
  pushLocaleSearchChunks(chunks, "sr", item);
  pushLocaleSearchChunks(chunks, "en", item);
  pushLocaleSearchChunks(chunks, "ru", item);

  const haystack = chunks.join(" ").toLowerCase().normalize("NFC");
  return haystack.includes(q);
}
