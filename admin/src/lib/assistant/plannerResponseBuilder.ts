import { getDisclaimers } from "./knowledge";
import type {
  PlannerAssistantContext,
  PlannerAssistantIntent,
  PlannerAssistantResponse,
  PlannerKnowledgeEntry,
} from "./types";

function defaultPlannerAnswer(
  intent: PlannerAssistantIntent,
  locale: PlannerAssistantContext["locale"],
): string {
  if (locale === "en") {
    if (intent === "unknown_value_help") {
      return "If exact values are unknown, enter approximate values and continue. You can refine inputs later.";
    }
    return "I can explain planner fields and suggest how to estimate values for this step.";
  }
  if (locale === "ru") {
    if (intent === "unknown_value_help") {
      return "Если точные значения неизвестны, укажите приблизительные и продолжайте. Позже можно уточнить.";
    }
    return "Я могу объяснить поля planner и подсказать, как оценить значения на этом шаге.";
  }
  if (intent === "unknown_value_help") {
    return "Ako nemate tačne vrednosti, unesite okvirne i nastavite. Kasnije možete precizirati unos.";
  }
  return "Mogu da objasnim planner polja i predložim kako da procenite unos za trenutni korak.";
}

export function buildPlannerAssistantResponse(
  intent: PlannerAssistantIntent,
  context: PlannerAssistantContext,
  entries: PlannerKnowledgeEntry[],
): PlannerAssistantResponse {
  const best = entries[0];
  const disclaimers = getDisclaimers(context.locale);
  const general = disclaimers.find((row) => row.category === "general")?.text;
  const answer = best?.content ?? defaultPlannerAnswer(intent, context.locale);
  const precisionHint =
    context.locale === "sr"
      ? "Ako unosite okvirne vrednosti, procena će biti manje precizna."
      : context.locale === "en"
        ? "If you enter approximate values, estimate precision will be lower."
        : "При приблизительном вводе точность оценки будет ниже.";

  return {
    intent,
    answer,
    confidence: best ? "high" : "medium",
    suggestedQuestions:
      context.locale === "sr"
        ? [
            "Šta znači ovo polje?",
            "Kako okvirno da procenim unos?",
            "Da li je dovoljno rough mode?",
          ]
        : context.locale === "en"
          ? [
              "What does this field mean?",
              "How can I estimate this value?",
              "Is rough mode enough here?",
            ]
          : [
              "Что означает это поле?",
              "Как оценить это значение?",
              "Достаточно ли rough режима?",
            ],
    disclaimers: general ? [general] : [],
    hints: [precisionHint],
  };
}
