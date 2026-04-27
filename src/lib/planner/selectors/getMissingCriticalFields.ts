import type { PlannerIntakeResult } from "../../../types/plannerIntake";

export function getMissingCriticalFields(result: PlannerIntakeResult | null): string[] {
  if (!result) return [];
  const criticalFromQuestions = result.clarificationQuestions
    .filter((q) => q.priority === "critical")
    .map((q) => q.fieldKey);
  const fromPrefill = result.plannerPrefill.unknownFieldKeys;
  return Array.from(new Set([...criticalFromQuestions, ...fromPrefill]));
}
