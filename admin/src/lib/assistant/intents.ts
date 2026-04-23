import type { AssistantIntent } from "./types";

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function containsAny(input: string, terms: string[]): boolean {
  return terms.some((term) => input.includes(term));
}

export function classifyIntent(message: string): AssistantIntent {
  const text = normalize(message);

  if (
    containsAny(text, [
      "dozvol",
      "zakon",
      "legal",
      "pravn",
      "regul",
      "permit",
      "law",
      "прав",
      "закон",
      "разреш",
    ])
  ) {
    return "legal_or_regulatory";
  }

  if (
    containsAny(text, [
      "planner",
      "planer",
      "step",
      "korak",
      "mere",
      "procen",
      "estimate",
      "планер",
      "оцен",
    ])
  ) {
    return "planner_help";
  }

  if (
    containsAny(text, [
      "dokument",
      "document",
      "guide",
      "vodič",
      "vodi",
      "документ",
      "гайд",
    ])
  ) {
    return "document_help";
  }

  if (containsAny(text, ["faq", "pitanje", "question", "вопрос"])) {
    return "faq_question";
  }

  if (
    containsAny(text, [
      "link",
      "zvanič",
      "official",
      "resource",
      "instituc",
      "извор",
      "официаль",
    ])
  ) {
    return "external_resource_request";
  }

  if (
    containsAny(text, [
      "gde",
      "gdje",
      "where",
      "navigate",
      "stranica",
      "page",
      "klik",
      "куде",
      "где",
      "страниц",
    ])
  ) {
    return "site_navigation";
  }

  return "fallback";
}
