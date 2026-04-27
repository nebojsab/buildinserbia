import type { PlannerIntakeResult } from "../../types/plannerIntake";
import { applyConfidencePolicy } from "./confidencePolicy";
import { normalizePlannerIntakeOutput } from "./normalizeExtraction";
import { isPlannerIntakeResult } from "./schema";
import { applyIntakeGuardrails } from "./guardrails";

type ExtractOptions = {
  locale?: "sr" | "en" | "ru";
  signal?: AbortSignal;
};

function getIntakeSystemPrompt(locale: string): string {
  return [
    "You are an intake extractor for a Serbian construction planner.",
    "Return strictly valid JSON. No markdown. No prose.",
    "Goal: classify user intent, parent category, child tasks, known/missing fields, and planner prefill.",
    "Allowed parentCategory: newbuild | reno | extension | interior | yard | unknown.",
    "Use only task keys known in planner (e.g. foundations, walls, roof, installations, finishing, fullbuild, ufh, winreplace, flooring, bathreno, electrical, plumbing, insulation, fullreno, furniture, kitchen, bathequip, lighting, decor, leveling, lawn, irrigation, fence, gate, paths, outdoorlight).",
    `Preferred response locale: ${locale}.`,
  ].join(" ");
}

function getModelName(): string {
  return process.env.PLANNER_INTAKE_MODEL || "openai/gpt-5.4-mini";
}

async function callGatewayForIntake(rawGoal: string, options: ExtractOptions): Promise<unknown> {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return null;
  const endpoint = process.env.AI_GATEWAY_BASE_URL || "https://ai-gateway.vercel.sh/v1/chat/completions";
  const locale = options.locale || "sr";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getModelName(),
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: getIntakeSystemPrompt(locale) },
        {
          role: "user",
          content: JSON.stringify({
            rawUserGoal: rawGoal,
            schemaHint: [
              "rawUserGoal",
              "detectedIntent",
              "parentCategory",
              "childTasks",
              "extractedEntities",
              "knownValues",
              "unknownValues",
              "assumptions",
              "confidence",
              "clarificationQuestions",
              "plannerPrefill",
              "recommendedStepOrder",
              "fallbackToBasicPlanner",
            ],
          }),
        },
      ],
    }),
    signal: options.signal,
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function extractPlannerIntake(rawGoal: string, options: ExtractOptions = {}): Promise<PlannerIntakeResult> {
  const llm = await callGatewayForIntake(rawGoal, options);
  const normalized = normalizePlannerIntakeOutput(rawGoal, llm);
  const policy = applyConfidencePolicy(normalized);
  const merged: PlannerIntakeResult = applyIntakeGuardrails({
    ...normalized,
    ...policy,
  });
  if (isPlannerIntakeResult(merged)) return merged;
  return applyIntakeGuardrails(normalizePlannerIntakeOutput(rawGoal, null));
}
