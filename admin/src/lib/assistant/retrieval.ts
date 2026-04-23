import {
  getFaq,
  getPlannerHelp,
  getSiteLinks,
  getTrustedLinks,
} from "./knowledge";
import type {
  AssistantIntent,
  AssistantLocale,
  FAQEntry,
  HelpArticle,
  SiteLink,
  TrustedExternalResource,
} from "./types";

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function scoreTextMatch(query: string, haystack: string): number {
  const q = normalize(query);
  const h = normalize(haystack);
  if (!q || !h) return 0;
  if (h.includes(q)) return 3;
  return q
    .split(/\s+/)
    .filter(Boolean)
    .reduce((score, token) => (h.includes(token) ? score + 1 : score), 0);
}

function top<T>(items: T[], limit = 3): T[] {
  return items.slice(0, limit);
}

export type RetrievalResult = {
  faq: FAQEntry[];
  plannerHelp: HelpArticle[];
  internalLinks: SiteLink[];
  externalLinks: TrustedExternalResource[];
};

export function retrieveContext(
  locale: AssistantLocale,
  intent: AssistantIntent,
  message: string,
): RetrievalResult {
  const faq = getFaq(locale)
    .map((entry) => ({
      entry,
      score:
        scoreTextMatch(message, entry.question) +
        scoreTextMatch(message, entry.answer) +
        entry.tags.reduce((acc, tag) => acc + scoreTextMatch(message, tag), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((row) => row.entry);

  const plannerHelp = getPlannerHelp(locale)
    .map((entry) => ({
      entry,
      score:
        scoreTextMatch(message, entry.title) +
        scoreTextMatch(message, entry.summary) +
        entry.tags.reduce((acc, tag) => acc + scoreTextMatch(message, tag), 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((row) => row.entry);

  const internalLinksBase = getSiteLinks(locale);
  const externalLinksBase = getTrustedLinks(locale);

  const intentDrivenLinks =
    intent === "document_help"
      ? internalLinksBase.filter((link) => link.tags.includes("dokumenti") || link.tags.includes("documents"))
      : intent === "planner_help"
        ? internalLinksBase.filter((link) => link.tags.includes("planner"))
        : intent === "faq_question"
          ? internalLinksBase.filter((link) => link.tags.includes("faq"))
          : internalLinksBase;

  const internalLinks = top(intentDrivenLinks.length > 0 ? intentDrivenLinks : internalLinksBase, 3);
  const externalLinks =
    intent === "external_resource_request" || intent === "legal_or_regulatory"
      ? top(externalLinksBase, 3)
      : [];

  return {
    faq: top(faq, 3),
    plannerHelp: top(plannerHelp, 3),
    internalLinks,
    externalLinks,
  };
}
