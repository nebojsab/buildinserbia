import type { ProjectType } from "./plan";

export type IntakeConfidenceLevel = "high" | "medium" | "low";

export type IntakeParentCategory = ProjectType | "unknown";

export type IntakePrimitive = string | number | boolean;

export type IntakeValue = IntakePrimitive | IntakePrimitive[] | null | undefined;

export type PlannerIntakeEntity = {
  key: string;
  value: IntakeValue;
  unit?: string;
  sourceText?: string;
  confidence: number;
};

export type PlannerIntakeClarificationQuestion = {
  id: string;
  fieldKey: string;
  question: string;
  reason: string;
  priority: "critical" | "important" | "optional";
};

export type PlannerIntakePrefill = {
  projectGoal: string;
  parentCategory: IntakeParentCategory;
  childTasks: string[];
  knownValues: Record<string, IntakeValue>;
  suggestedValues: Record<string, IntakeValue>;
  unknownFieldKeys: string[];
  recommendedNextStep: "tasks" | "details" | "infrastructure";
  skipSteps: Array<"category" | "tasks">;
};

export type PlannerIntakeResult = {
  rawUserGoal: string;
  detectedIntent: string;
  parentCategory: IntakeParentCategory;
  childTasks: string[];
  extractedEntities: PlannerIntakeEntity[];
  knownValues: Record<string, IntakeValue>;
  unknownValues: string[];
  assumptions: string[];
  confidence: {
    overall: number;
    level: IntakeConfidenceLevel;
    byField: Record<string, number>;
  };
  clarificationQuestions: PlannerIntakeClarificationQuestion[];
  plannerPrefill: PlannerIntakePrefill;
  recommendedStepOrder: string[];
  fallbackToBasicPlanner: boolean;
};

export type PlannerStatePatch = {
  pType: ProjectType | null;
  selTasks: string[];
  projectGoal?: string;
  size?: string;
  commonDetails?: Record<string, IntakeValue>;
  conditionalDetails?: Record<string, IntakeValue>;
  startStep?: 0 | 1 | 2 | 3;
  skipCategoryStep?: boolean;
  skipTaskStep?: boolean;
  missingFieldKeys?: string[];
  source: "llm-intake";
};
