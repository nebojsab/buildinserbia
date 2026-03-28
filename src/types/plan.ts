export type ProjectType = "newbuild" | "reno" | "interior" | "yard";

export interface PlanForm {
  projectType: ProjectType | null;
  tasks: string[];
  size: string;
  budget: number;
  stage: number;
  userType: number;
  infra: number;
  location: string;
}

export interface PlanStep {
  step: string;
  task: string;
}

export interface GeneratedPlan {
  isMicro: boolean;
  projectType: ProjectType | null;
  tasks: string[];
  steps: PlanStep[];
  costs: { lo: number; hi: number };
  affKeys: string[];
  notes: string[];
  infraExtras: { key: string; note: string }[];
  next: string[];
  infraPartial: boolean;
  infraNone: boolean;
}
