export type PlannerAssistantBridgeLocale = "sr" | "en" | "ru";

/** Snapshot published by Planner for the Next.js site assistant (read via window). */
export type PlannerAssistantBridgeSnapshot = {
  locale: PlannerAssistantBridgeLocale;
  currentPage: string;
  currentStep?: "type" | "tasks" | "details" | "infrastructure";
  selectedProjectType?: string;
  selectedTasks?: string[];
  visibleFields?: string[];
  partiallyFilledValues?: Record<string, string | number | boolean | null>;
  estimateModeByTask?: Record<string, "exact" | "rough">;
};

declare global {
  interface Window {
    __buildInSerbiaPlannerContext?: PlannerAssistantBridgeSnapshot | undefined;
  }
}

export {};
