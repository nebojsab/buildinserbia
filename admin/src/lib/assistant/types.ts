export type AssistantLocale = "sr" | "en" | "ru";

export type AssistantIntent =
  | "site_navigation"
  | "planner_help"
  | "document_help"
  | "faq_question"
  | "external_resource_request"
  | "legal_or_regulatory"
  | "fallback";

export type KBType = "faq" | "planner_help";

export type FAQEntry = {
  id: string;
  locale: AssistantLocale;
  question: string;
  answer: string;
  tags: string[];
  relatedLinkIds?: string[];
};

export type HelpArticle = {
  id: string;
  locale: AssistantLocale;
  type: KBType;
  title: string;
  summary: string;
  content: string;
  tags: string[];
};

export type SiteLink = {
  id: string;
  locale: AssistantLocale;
  title: string;
  path: string;
  tags: string[];
};

export type TrustedExternalResource = {
  id: string;
  locale: AssistantLocale;
  title: string;
  url: string;
  tags: string[];
  trustLevel: "official" | "verified_partner";
};

export type AssistantDisclaimer = {
  id: string;
  locale: AssistantLocale;
  category: "general" | "legal_or_regulatory";
  text: string;
};

export type AssistantRequest = {
  message: string;
  locale?: AssistantLocale;
  currentPage?: string;
};

export type AssistantFeedbackRequest = {
  messageId: string;
  helpful: boolean;
  locale: AssistantLocale;
  intent: AssistantIntent;
  question?: string;
  answer?: string;
  currentPage?: string;
  currentHash?: string;
  plannerContext?: PlannerAssistantContext;
};

export type AssistantResponse = {
  intent: AssistantIntent;
  answer: string;
  confidence: "high" | "medium" | "low";
  internalLinks: SiteLink[];
  externalLinks: TrustedExternalResource[];
  disclaimers: string[];
  suggestedQuestions: string[];
};

export type PlannerAssistantContext = {
  locale: AssistantLocale;
  currentPage: string;
  currentStep?: "type" | "tasks" | "details" | "infrastructure";
  selectedProjectType?: string;
  selectedTasks?: string[];
  visibleFields?: string[];
  partiallyFilledValues?: Record<string, string | number | boolean | null>;
  estimateModeByTask?: Record<string, "exact" | "rough">;
};

export type PlannerAssistantRequest = {
  message: string;
  context: PlannerAssistantContext;
};

export type PlannerAssistantIntent =
  | "explain_field"
  | "explain_step"
  | "estimate_input"
  | "unknown_value_help"
  | "task_guidance"
  | "scope_clarification"
  | "precision_warning"
  | "fallback";

export type PlannerKnowledgeEntry = {
  id: string;
  locale: AssistantLocale;
  type:
    | "step_explanation"
    | "field_help"
    | "task_guidance"
    | "estimation_tip"
    | "fallback";
  title: string;
  content: string;
  tags: string[];
  stepKey?: string;
  fieldKey?: string;
  taskKey?: string;
};

export type PlannerAssistantResponse = {
  intent: PlannerAssistantIntent;
  answer: string;
  confidence: "high" | "medium" | "low";
  suggestedQuestions: string[];
  disclaimers: string[];
  hints: string[];
};
