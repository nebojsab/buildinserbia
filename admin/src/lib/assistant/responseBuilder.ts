import { getQuickActions } from "./knowledge";
import { disclaimersForIntent } from "./guardrails";
import type {
  AssistantIntent,
  AssistantLocale,
  AssistantResponse,
} from "./types";
import type { RetrievalResult } from "./retrieval";

function answerByIntent(
  intent: AssistantIntent,
  locale: AssistantLocale,
  retrieval: RetrievalResult,
): string {
  const faqFirst = retrieval.faq[0];
  const plannerFirst = retrieval.plannerHelp[0];

  if (faqFirst) return faqFirst.answer;

  switch (intent) {
    case "planner_help":
      if (plannerFirst) return plannerFirst.content;
      return locale === "sr"
        ? "Mogu da objasnim planner korake i šta da unesete ako ne znate tačne vrednosti."
        : locale === "en"
          ? "I can explain planner steps and what to enter if exact values are unknown."
          : "Я могу объяснить шаги planner и что вводить, если точные значения неизвестны.";
    case "document_help":
      return locale === "sr"
        ? "Mogu da vas usmerim na relevantne dokumente i vodiče na sajtu."
        : locale === "en"
          ? "I can direct you to relevant documents and guides on the site."
          : "Я могу направить вас к релевантным документам и гайдам на сайте.";
    case "external_resource_request":
      return locale === "sr"
        ? "Izdvojio sam proverene zvanične izvore koji mogu pomoći za ovu temu."
        : locale === "en"
          ? "I selected trusted official sources that can help for this topic."
          : "Я подобрал проверенные официальные источники по этой теме.";
    case "legal_or_regulatory":
      return locale === "sr"
        ? "Mogu dati samo opšte informativne smernice. Za konačne procedure koristite zvanične izvore."
        : locale === "en"
          ? "I can provide only general informational guidance. For final procedures, use official sources."
          : "Я могу дать только общие информационные рекомендации. Для точных процедур используйте официальные источники.";
    case "site_navigation":
      return locale === "sr"
        ? "Mogu vas uputiti na odgovarajuće stranice sajta za sledeći korak."
        : locale === "en"
          ? "I can direct you to the most relevant site pages for your next step."
          : "Я могу направить вас на релевантные страницы сайта для следующего шага.";
    case "faq_question":
      return locale === "sr"
        ? "Pronašao sam najbliži FAQ odgovor iz interne baze."
        : locale === "en"
          ? "I found the closest FAQ answer from the internal knowledge base."
          : "Я нашел наиболее подходящий ответ FAQ из внутренней базы знаний.";
    case "fallback":
    default:
      return locale === "sr"
        ? "Nisam siguran da je ovo u domenu ovog helpera. Mogu pomoći oko navigacije, plannera, FAQ i dokumenata."
        : locale === "en"
          ? "I am not sure this is within this helper scope. I can help with navigation, planner, FAQ, and documents."
          : "Похоже, это вне области данного помощника. Я могу помочь с навигацией, planner, FAQ и документами.";
  }
}

export function buildAssistantResponse(
  intent: AssistantIntent,
  locale: AssistantLocale,
  retrieval: RetrievalResult,
): AssistantResponse {
  const suggestedQuestions = getQuickActions(locale).slice(0, 4);
  return {
    intent,
    answer: answerByIntent(intent, locale, retrieval),
    confidence: retrieval.faq.length > 0 || retrieval.plannerHelp.length > 0 ? "high" : "medium",
    internalLinks: retrieval.internalLinks,
    externalLinks: retrieval.externalLinks,
    disclaimers: disclaimersForIntent(intent, locale),
    suggestedQuestions,
  };
}
