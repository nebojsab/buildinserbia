import type { PlannerIntakeResult } from "../../types/plannerIntake";

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}

function isStringArray(input: unknown): input is string[] {
  return Array.isArray(input) && input.every((item) => typeof item === "string");
}

function hasConfidenceShape(input: unknown): boolean {
  if (!isRecord(input)) return false;
  return (
    typeof input.overall === "number" &&
    (input.level === "high" || input.level === "medium" || input.level === "low") &&
    isRecord(input.byField)
  );
}

export function isPlannerIntakeResult(input: unknown): input is PlannerIntakeResult {
  if (!isRecord(input)) return false;
  if (typeof input.rawUserGoal !== "string") return false;
  if (typeof input.detectedIntent !== "string") return false;
  if (!isStringArray(input.childTasks)) return false;
  if (!Array.isArray(input.extractedEntities)) return false;
  if (!isRecord(input.knownValues)) return false;
  if (!isStringArray(input.unknownValues)) return false;
  if (!Array.isArray(input.assumptions)) return false;
  if (!hasConfidenceShape(input.confidence)) return false;
  if (!Array.isArray(input.clarificationQuestions)) return false;
  if (!isRecord(input.plannerPrefill)) return false;
  if (!isStringArray(input.recommendedStepOrder)) return false;
  if (typeof input.fallbackToBasicPlanner !== "boolean") return false;
  return true;
}
