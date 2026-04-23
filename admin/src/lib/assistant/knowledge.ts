import faqSeed from "@/data/assistant/faq.json";
import plannerHelpSeed from "@/data/assistant/planner-help.json";
import siteLinksSeed from "@/data/assistant/site-links.json";
import trustedLinksSeed from "@/data/assistant/trusted-links.json";
import disclaimersSeed from "@/data/assistant/disclaimers.json";
import quickActionsSeed from "@/data/assistant/quick-actions.json";
import plannerKbSeed from "@/data/assistant/planner-kb.json";
import type {
  AssistantDisclaimer,
  AssistantLocale,
  FAQEntry,
  HelpArticle,
  PlannerKnowledgeEntry,
  SiteLink,
  TrustedExternalResource,
} from "./types";

function byLocale<T extends { locale: AssistantLocale }>(
  rows: T[],
  locale: AssistantLocale,
): T[] {
  const exact = rows.filter((row) => row.locale === locale);
  if (exact.length > 0) return exact;
  return rows.filter((row) => row.locale === "sr");
}

export function getFaq(locale: AssistantLocale): FAQEntry[] {
  return byLocale(faqSeed as FAQEntry[], locale);
}

export function getPlannerHelp(locale: AssistantLocale): HelpArticle[] {
  return byLocale(plannerHelpSeed as HelpArticle[], locale);
}

export function getSiteLinks(locale: AssistantLocale): SiteLink[] {
  return byLocale(siteLinksSeed as SiteLink[], locale);
}

export function getTrustedLinks(locale: AssistantLocale): TrustedExternalResource[] {
  return byLocale(trustedLinksSeed as TrustedExternalResource[], locale);
}

export function getDisclaimers(locale: AssistantLocale): AssistantDisclaimer[] {
  return byLocale(disclaimersSeed as AssistantDisclaimer[], locale);
}

export function getQuickActions(locale: AssistantLocale): string[] {
  const rows = byLocale(
    quickActionsSeed as Array<{ locale: AssistantLocale; text: string }>,
    locale,
  );
  return rows.map((row) => row.text);
}

export function getPlannerKB(locale: AssistantLocale): PlannerKnowledgeEntry[] {
  return byLocale(plannerKbSeed as PlannerKnowledgeEntry[], locale);
}
