import { getDisclaimers } from "./knowledge";
import type { AssistantIntent, AssistantLocale } from "./types";

export function disclaimersForIntent(
  intent: AssistantIntent,
  locale: AssistantLocale,
): string[] {
  const disclaimers = getDisclaimers(locale);
  const general = disclaimers.find((row) => row.category === "general");
  const legal = disclaimers.find((row) => row.category === "legal_or_regulatory");

  if (intent === "legal_or_regulatory") {
    return [legal?.text ?? general?.text ?? ""].filter(Boolean);
  }

  if (intent === "fallback") {
    return [general?.text ?? ""].filter(Boolean);
  }

  return [];
}
