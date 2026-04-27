import type { PlannerIntakeResult, PlannerStatePatch } from "../types/plannerIntake";

export type PlannerIntakeResponse = {
  intake: PlannerIntakeResult;
  plannerPatch: PlannerStatePatch;
};

export async function runPlannerIntake(
  rawUserGoal: string,
  locale: "sr" | "en" | "ru",
): Promise<PlannerIntakeResponse> {
  const response = await fetch("/api/planner-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawUserGoal, locale }),
  });
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    if (response.status === 404) {
      throw new Error("Planner intake API is not available in this runtime.");
    }
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as { error?: string; message?: string };
      throw new Error(payload.message || payload.error || "Planner intake failed");
    }
    throw new Error("Planner intake request failed. You can continue with the regular planner flow.");
  }
  return (await response.json()) as PlannerIntakeResponse;
}
