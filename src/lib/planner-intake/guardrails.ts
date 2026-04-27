import type { PlannerIntakeResult } from "../../types/plannerIntake";

const SAFE_TASK_KEYS = new Set([
  "foundations",
  "walls",
  "roof",
  "installations",
  "finishing",
  "fullbuild",
  "ufh",
  "winreplace",
  "flooring",
  "bathreno",
  "electrical",
  "plumbing",
  "insulation",
  "fullreno",
  "furniture",
  "kitchen",
  "bathequip",
  "lighting",
  "decor",
  "leveling",
  "lawn",
  "irrigation",
  "fence",
  "gate",
  "paths",
  "outdoorlight",
]);

export function applyIntakeGuardrails(result: PlannerIntakeResult): PlannerIntakeResult {
  const filteredTasks = result.childTasks.filter((task) => SAFE_TASK_KEYS.has(task));
  const fallbackToBasicPlanner =
    result.fallbackToBasicPlanner ||
    result.parentCategory === "unknown" ||
    filteredTasks.length === 0 ||
    result.confidence.level === "low";

  const assumptions = [
    ...result.assumptions.filter((line) => line.trim().length > 0).slice(0, 3),
    "AI intake je pomoć za usmeravanje; konačne tehničke i pravne odluke zahteva potvrdu stručnog lica.",
  ];

  return {
    ...result,
    childTasks: filteredTasks,
    assumptions,
    fallbackToBasicPlanner,
    plannerPrefill: {
      ...result.plannerPrefill,
      childTasks: filteredTasks,
    },
  };
}
