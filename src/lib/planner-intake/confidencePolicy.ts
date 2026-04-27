import type { IntakeConfidenceLevel, PlannerIntakeResult } from "../../types/plannerIntake";

type ConfidenceDecision = Pick<
  PlannerIntakeResult,
  "fallbackToBasicPlanner" | "clarificationQuestions" | "confidence"
>;

const HIGH_THRESHOLD = 0.8;
const MEDIUM_THRESHOLD = 0.55;
const MAX_CLARIFICATIONS = 3;

function levelFromScore(score: number): IntakeConfidenceLevel {
  if (score >= HIGH_THRESHOLD) return "high";
  if (score >= MEDIUM_THRESHOLD) return "medium";
  return "low";
}

export function applyConfidencePolicy(result: PlannerIntakeResult): ConfidenceDecision {
  const normalizedOverall = Number.isFinite(result.confidence.overall)
    ? Math.max(0, Math.min(1, result.confidence.overall))
    : 0;
  const level = levelFromScore(normalizedOverall);
  const trimmedQuestions = result.clarificationQuestions.slice(0, MAX_CLARIFICATIONS);
  const hasCoreRouting = result.parentCategory !== "unknown" && result.childTasks.length > 0;
  const fallbackToBasicPlanner = level === "low" || !hasCoreRouting;
  return {
    fallbackToBasicPlanner,
    clarificationQuestions: trimmedQuestions,
    confidence: {
      ...result.confidence,
      overall: normalizedOverall,
      level,
    },
  };
}
