import type { ProjectType } from "./plan";

/** App UI language; matches DocLang in generateProjectDocs. */
export type AppLocale = "sr" | "en" | "ru";

export type ArtifactType =
  | "project_summary"
  | "scope_of_work"
  | "rough_budget"
  | "next_steps";

export type ArtifactStatus = "draft" | "confirmed" | "needs_input";

export type ProjectArtifact = {
  id: string;
  type: ArtifactType;
  title: string;
  status: ArtifactStatus;
  content: string;
  assumptions: string[];
  updatedAt: string;
};

export type ProjectFact = {
  value: string | number | boolean;
  confidence: "low" | "medium" | "high";
};

export type ProjectState = {
  sessionId: string;
  goal: string;
  projectType: ProjectType | null;
  intent: string | null;
  location: string | null;
  constraints: {
    budgetBand: "low" | "mid" | "high" | "unknown";
    timeline: string | null;
  };
  knownFacts: Record<string, ProjectFact>;
  openQuestions: string[];
  selectedTasks: string[];
  artifacts: ProjectArtifact[];
  lastUpdatedAt: string;
};

export type ArtifactJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  title: string;
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
};

export const PROJECT_ARTIFACT_SCHEMA: ArtifactJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "BuildInSerbia Project Artifact",
  type: "object",
  properties: {
    id: { type: "string" },
    type: {
      type: "string",
      enum: ["project_summary", "scope_of_work", "rough_budget", "next_steps"],
    },
    title: { type: "string" },
    status: { type: "string", enum: ["draft", "confirmed", "needs_input"] },
    content: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["id", "type", "title", "status", "content", "assumptions", "updatedAt"],
};

export const PROJECT_STATE_SCHEMA: ArtifactJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "BuildInSerbia Project State",
  type: "object",
  properties: {
    sessionId: { type: "string" },
    goal: { type: "string" },
    projectType: {
      anyOf: [
        { type: "null" },
        { type: "string", enum: ["newbuild", "reno", "extension", "interior", "yard"] },
      ],
    },
    intent: { anyOf: [{ type: "null" }, { type: "string" }] },
    location: { anyOf: [{ type: "null" }, { type: "string" }] },
    constraints: {
      type: "object",
      properties: {
        budgetBand: { type: "string", enum: ["low", "mid", "high", "unknown"] },
        timeline: { anyOf: [{ type: "null" }, { type: "string" }] },
      },
      required: ["budgetBand", "timeline"],
    },
    knownFacts: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          value: { anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }] },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["value", "confidence"],
      },
    },
    openQuestions: { type: "array", items: { type: "string" } },
    selectedTasks: { type: "array", items: { type: "string" } },
    artifacts: { type: "array", items: PROJECT_ARTIFACT_SCHEMA },
    lastUpdatedAt: { type: "string", format: "date-time" },
  },
  required: [
    "sessionId",
    "goal",
    "projectType",
    "intent",
    "location",
    "constraints",
    "knownFacts",
    "openQuestions",
    "selectedTasks",
    "artifacts",
    "lastUpdatedAt",
  ],
};

export type PlannerIntakeInput = {
  goal: string;
  projectType: ProjectType | null;
  location: string;
  tasks: string[];
  stage: number;
  budget: number;
  /** UI locale — drives tool labels and artifact wording. */
  locale: AppLocale;
};

export type ToolResult<TOutput> = {
  output: TOutput;
  assumptions: string[];
  confidence: "low" | "medium" | "high";
};
