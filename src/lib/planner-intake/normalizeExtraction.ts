import type {
  IntakeParentCategory,
  IntakeValue,
  PlannerIntakeResult,
  PlannerIntakeClarificationQuestion,
} from "../../types/plannerIntake";
import { normalizeIntakeFieldKey, normalizeIntakeFieldRecord } from "./fieldAliases";

const RE_NUM = /(\d{1,4})(?!\s*%)/g;

const FALLBACK_QUESTIONS: Record<IntakeParentCategory, PlannerIntakeClarificationQuestion[]> = {
  unknown: [
    {
      id: "clarify-category",
      fieldKey: "projectType",
      question: "Da li je ovo više renoviranje, nova gradnja, nadogradnja, enterijer ili dvorište?",
      reason: "Bez tipa projekta ne možemo usmeriti planner.",
      priority: "critical",
    },
  ],
  newbuild: [
    {
      id: "newbuild-area",
      fieldKey: "totalPropertyAreaM2",
      question: "Kolika je okvirna bruto kvadratura (m²)?",
      reason: "Kvadratura je ključna za sledeće procene.",
      priority: "critical",
    },
  ],
  reno: [
    {
      id: "reno-scope",
      fieldKey: "scope",
      question: "Da li je kompletno renoviranje ili samo pojedinačne stavke?",
      reason: "Potrebno za tačan odabir taskova.",
      priority: "important",
    },
  ],
  extension: [
    {
      id: "extension-two-areas",
      fieldKey: "extensionAreaM2",
      question: "Navedite postojeću i novu kvadraturu (npr. 110 i 35 m²).",
      reason: "Za nadogradnju su potrebne obe vrednosti.",
      priority: "critical",
    },
  ],
  interior: [
    {
      id: "interior-room",
      fieldKey: "interiorScope",
      question: "Koje prostorije su u fokusu?",
      reason: "Filtriramo samo relevantna pitanja.",
      priority: "important",
    },
  ],
  yard: [
    {
      id: "yard-size",
      fieldKey: "lotAreaM2",
      question: "Kolika je približna površina placa/dvorišta?",
      reason: "Površina utiče na obim radova.",
      priority: "important",
    },
  ],
};

function asRecord(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
}

function stringOrEmpty(input: unknown): string {
  return typeof input === "string" ? input : "";
}

function stringArray(input: unknown): string[] {
  return Array.isArray(input) ? input.filter((item): item is string => typeof item === "string") : [];
}

function mapParentCategory(input: unknown): IntakeParentCategory {
  if (
    input === "newbuild" ||
    input === "reno" ||
    input === "extension" ||
    input === "interior" ||
    input === "yard"
  ) {
    return input;
  }
  if (typeof input === "string") {
    const low = input.toLowerCase();
    if (low.includes("new")) return "newbuild";
    if (low.includes("reno")) return "reno";
    if (low.includes("extend")) return "extension";
    if (low.includes("inter")) return "interior";
    if (low.includes("yard") || low.includes("garden")) return "yard";
  }
  return "unknown";
}

function detectFallbackFromText(rawGoal: string): {
  parentCategory: IntakeParentCategory;
  childTasks: string[];
  knownValues: Record<string, IntakeValue>;
} {
  const low = rawGoal.toLowerCase();
  const nums = [...rawGoal.matchAll(RE_NUM)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
  const knownValues: Record<string, IntakeValue> = {};
  if (nums.length > 0) knownValues.totalPropertyAreaM2 = nums[0];
  const has = (term: string) => low.includes(term);
  const hasWord = (re: RegExp) => re.test(low);
  const interiorTasks: string[] = [];
  if (has("kuhinj")) interiorTasks.push("kitchen");
  if (has("rasvet") || has("svetl")) interiorTasks.push("lighting");
  if (interiorTasks.length > 0) return { parentCategory: "interior", childTasks: interiorTasks, knownValues };
  const renoTasks: string[] = [];
  if (has("kupatil")) renoTasks.push("bathreno");
  if (has("proz")) renoTasks.push("winreplace");
  if (renoTasks.length > 0) return { parentCategory: "reno", childTasks: renoTasks, knownValues };
  const hasFenceIntent =
    hasWord(/\bograd[aeiuom]?\b/) ||
    hasWord(/\bogradu\b/) ||
    hasWord(/\bograda\b/) ||
    hasWord(/\bfence\b/);
  const hasGateIntent = hasWord(/\bkapij[aeiuom]?\b/) || hasWord(/\bgate\b/);
  if (hasFenceIntent || hasGateIntent) {
    return {
      parentCategory: "yard",
      childTasks: [hasFenceIntent ? "fence" : "", hasGateIntent ? "gate" : ""].filter(Boolean),
      knownValues,
    };
  }
  if (has("nadograd") || has("dograd")) return { parentCategory: "extension", childTasks: ["fullbuild"], knownValues };
  if (has("nova ku") || has("novu ku") || has("new house")) return { parentCategory: "newbuild", childTasks: ["fullbuild"], knownValues };
  if (has("renov")) return { parentCategory: "reno", childTasks: ["fullreno"], knownValues };
  return { parentCategory: "unknown", childTasks: [], knownValues };
}

export function normalizePlannerIntakeOutput(rawGoal: string, llmOutput: unknown): PlannerIntakeResult {
  const root = asRecord(llmOutput);
  const plannerPrefill = asRecord(root.plannerPrefill);
  const fallback = detectFallbackFromText(rawGoal);
  const parentCategory = mapParentCategory(root.parentCategory ?? root.parent_category ?? fallback.parentCategory);
  const childTasks = stringArray(root.childTasks ?? root.child_tasks);
  const knownValues = normalizeIntakeFieldRecord(
    asRecord(root.knownValues ?? root.known_values) as Record<string, IntakeValue>,
  );
  const confidenceRoot = asRecord(root.confidence);
  const overall =
    typeof confidenceRoot.overall === "number"
      ? confidenceRoot.overall
      : parentCategory !== "unknown"
        ? 0.68
        : 0.35;
  const knownMerged = normalizeIntakeFieldRecord({
    ...fallback.knownValues,
    ...knownValues,
  } as Record<string, IntakeValue>);
  const tasksMerged = childTasks.length > 0 ? childTasks : fallback.childTasks;

  return {
    rawUserGoal: rawGoal,
    detectedIntent: stringOrEmpty(root.detectedIntent ?? root.detected_intent) || "planner-intake",
    parentCategory,
    childTasks: tasksMerged,
    extractedEntities: Array.isArray(root.extractedEntities) ? (root.extractedEntities as PlannerIntakeResult["extractedEntities"]) : [],
    knownValues: knownMerged,
    unknownValues: stringArray(root.unknownValues ?? root.unknown_values),
    assumptions: stringArray(root.assumptions),
    confidence: {
      overall,
      level: "medium",
      byField: asRecord(confidenceRoot.byField) as Record<string, number>,
    },
    clarificationQuestions:
      Array.isArray(root.clarificationQuestions) && root.clarificationQuestions.length > 0
        ? (root.clarificationQuestions as PlannerIntakeClarificationQuestion[])
        : FALLBACK_QUESTIONS[parentCategory],
    plannerPrefill: {
      projectGoal: stringOrEmpty(plannerPrefill.projectGoal) || rawGoal,
      parentCategory,
      childTasks: tasksMerged,
      knownValues: knownMerged,
      suggestedValues: asRecord(plannerPrefill.suggestedValues) as Record<string, IntakeValue>,
      unknownFieldKeys: stringArray(plannerPrefill.unknownFieldKeys).map(normalizeIntakeFieldKey),
      recommendedNextStep: (() => {
        const next = plannerPrefill.recommendedNextStep;
        if (next === "tasks" || next === "details" || next === "infrastructure") return next;
        return tasksMerged.length > 0 ? "details" : "tasks";
      })(),
      skipSteps: Array.isArray(plannerPrefill.skipSteps)
        ? ((plannerPrefill.skipSteps as unknown[]).filter(
            (s): s is "category" | "tasks" => s === "category" || s === "tasks",
          ) as Array<"category" | "tasks">)
        : tasksMerged.length > 0
          ? ["category", "tasks"]
          : [],
    },
    recommendedStepOrder: stringArray(root.recommendedStepOrder ?? root.recommended_step_order),
    fallbackToBasicPlanner: Boolean(root.fallbackToBasicPlanner),
  };
}
