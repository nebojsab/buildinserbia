import type { PlannerIntakeClarificationQuestion, PlannerIntakeResult, IntakeValue } from "../../types/plannerIntake";
import { normalizeIntakeFieldKey } from "./fieldAliases";

const MAX_QUESTIONS = 3;

export function getClarificationQuestions(result: PlannerIntakeResult): PlannerIntakeClarificationQuestion[] {
  return result.clarificationQuestions
    .filter((q) => q.priority === "critical" || q.priority === "important")
    .slice(0, MAX_QUESTIONS);
}

export function applyClarificationAnswers(
  result: PlannerIntakeResult,
  answers: Record<string, string>,
): PlannerIntakeResult {
  const entries = Object.entries(answers).filter(([, value]) => value.trim().length > 0);
  if (entries.length === 0) return result;

  const normalizedEntries = entries.map(([fieldKey, value]) => {
    const trimmed = value.trim();
    const numeric = Number(trimmed.replace(",", "."));
    const parsed: IntakeValue = Number.isFinite(numeric) && trimmed.length <= 8 ? numeric : trimmed;
    return [normalizeIntakeFieldKey(fieldKey), parsed] as const;
  });
  const knownValues = {
    ...result.plannerPrefill.knownValues,
    ...Object.fromEntries(normalizedEntries),
  };
  const answeredFieldKeys = new Set(normalizedEntries.map(([fieldKey]) => fieldKey));
  const unknownFieldKeys = result.plannerPrefill.unknownFieldKeys.filter((k) => !answeredFieldKeys.has(k));
  const clarificationQuestions = result.clarificationQuestions.filter((q) => !answeredFieldKeys.has(q.fieldKey));

  return {
    ...result,
    knownValues,
    clarificationQuestions,
    plannerPrefill: {
      ...result.plannerPrefill,
      knownValues,
      unknownFieldKeys,
    },
  };
}
