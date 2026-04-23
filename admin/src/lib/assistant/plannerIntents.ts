import type { PlannerAssistantIntent } from "./types";

function containsAny(input: string, terms: string[]): boolean {
  return terms.some((term) => input.includes(term));
}

export function classifyPlannerIntent(message: string): PlannerAssistantIntent {
  const text = message.toLowerCase().trim();

  if (containsAny(text, ["sta znaci", "what is", "что значит", "polje", "field"])) {
    return "explain_field";
  }
  if (containsAny(text, ["korak", "step", "шаг"])) {
    return "explain_step";
  }
  if (containsAny(text, ["procen", "estimate", "оцен", "koliko", "how much"])) {
    return "estimate_input";
  }
  if (
    containsAny(text, [
      "ne znam",
      "don't know",
      "dont know",
      "nije poznato",
      "не знаю",
      "unknown",
    ])
  ) {
    return "unknown_value_help";
  }
  if (containsAny(text, ["task", "zadat", "winreplace", "bathreno", "задач"])) {
    return "task_guidance";
  }
  if (containsAny(text, ["delimicno", "partial", "full", "komplet", "scope", "объем"])) {
    return "scope_clarification";
  }
  if (containsAny(text, ["preciz", "tačnost", "accuracy", "точност"])) {
    return "precision_warning";
  }
  return "fallback";
}
