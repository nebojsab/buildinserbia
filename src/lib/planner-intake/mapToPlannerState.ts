import type { ProjectType } from "../../types/plan";
import type { IntakeValue, PlannerIntakeResult, PlannerStatePatch } from "../../types/plannerIntake";
import { normalizeIntakeFieldKey, normalizeIntakeFieldRecord } from "./fieldAliases";

const TASK_KEY_ALIASES: Record<string, string> = {
  // new build / extension
  full_build: "fullbuild",
  complete_build: "fullbuild",
  foundations: "foundations",
  walls: "walls",
  roof: "roof",
  installations: "installations",
  finishing: "finishing",
  // renovation
  underfloor_heating: "ufh",
  window_replacement: "winreplace",
  flooring: "flooring",
  bathroom_renovation: "bathreno",
  electrical_works: "electrical",
  plumbing_works: "plumbing",
  insulation: "insulation",
  full_renovation: "fullreno",
  // interior
  furniture: "furniture",
  kitchen: "kitchen",
  bathroom_equipment: "bathequip",
  lighting: "lighting",
  decoration: "decor",
  // yard
  ground_leveling: "leveling",
  lawn: "lawn",
  irrigation: "irrigation",
  fence: "fence",
  gate: "gate",
  paths_paving: "paths",
  outdoor_lighting: "outdoorlight",
};

function asProjectType(value: string): ProjectType | null {
  if (
    value === "newbuild" ||
    value === "reno" ||
    value === "extension" ||
    value === "interior" ||
    value === "yard"
  ) {
    return value;
  }
  return null;
}

function normalizeTaskKey(taskKey: string): string {
  const normalized = taskKey.trim().toLowerCase();
  return TASK_KEY_ALIASES[normalized] ?? normalized;
}

function pickStartStep(next: string): 0 | 1 | 2 | 3 {
  if (next === "tasks") return 1;
  if (next === "details") return 2;
  if (next === "infrastructure") return 3;
  return 0;
}

function pickSizeValue(values: Record<string, IntakeValue>): string | undefined {
  const direct = values.totalPropertyAreaM2 ?? values.total_area_m2 ?? values.area_m2;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  if (typeof direct === "number" && Number.isFinite(direct)) return String(direct);
  return undefined;
}

function splitDetailsByProjectType(
  projectType: ProjectType | null,
  values: Record<string, IntakeValue>,
): Pick<PlannerStatePatch, "commonDetails" | "conditionalDetails"> {
  if (!projectType) return {};
  const normalized = normalizeIntakeFieldRecord(values);
  if (projectType === "reno") return { commonDetails: normalized };
  return { conditionalDetails: normalized };
}

export function mapIntakeToPlannerState(intake: PlannerIntakeResult): PlannerStatePatch {
  const prefill = intake.plannerPrefill;
  const pType = asProjectType(prefill.parentCategory);
  const selTasks = prefill.childTasks.map(normalizeTaskKey);
  const normalizedUnknownFieldKeys = prefill.unknownFieldKeys.map(normalizeIntakeFieldKey);
  const patch: PlannerStatePatch = {
    pType,
    selTasks,
    projectGoal: prefill.projectGoal || intake.rawUserGoal,
    startStep: pickStartStep(prefill.recommendedNextStep),
    skipCategoryStep: prefill.skipSteps.includes("category"),
    skipTaskStep: prefill.skipSteps.includes("tasks"),
    missingFieldKeys: normalizedUnknownFieldKeys,
    source: "llm-intake",
    ...splitDetailsByProjectType(pType, prefill.knownValues),
  };
  const size = pickSizeValue(prefill.knownValues);
  if (size) patch.size = size;
  return patch;
}
