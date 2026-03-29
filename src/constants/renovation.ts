import type { ProjectType } from "../types/plan";

/** Renovation “full package” shortcut key in the planner (not expanded in UI). */
export const FULL_RENOVATION_TASK_KEY = "fullreno";

/** Maps UI selection to tasks stored on `PlanForm` / passed to `generatePlan`. */
export function resolveTasksForPlanSubmit(
  projectType: ProjectType | null,
  selectedTaskKeys: string[],
  renoGranularKeys: string[],
): string[] {
  if (projectType !== "reno") return selectedTaskKeys;
  if (
    selectedTaskKeys.length === 1 &&
    selectedTaskKeys[0] === FULL_RENOVATION_TASK_KEY
  ) {
    return [...renoGranularKeys];
  }
  return selectedTaskKeys.filter((k) => k !== FULL_RENOVATION_TASK_KEY);
}
