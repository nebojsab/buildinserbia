import type { PlannerIntakeResult } from "../src/types/plannerIntake";
import { extractPlannerIntake } from "../src/lib/planner-intake/extractGoal";
import { mapIntakeToPlannerState } from "../src/lib/planner-intake/mapToPlannerState";

type RequestBody = {
  rawUserGoal?: string;
  locale?: "sr" | "en" | "ru";
};

function json(res: any, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const body = (req.body ?? {}) as RequestBody;
    const rawUserGoal = typeof body.rawUserGoal === "string" ? body.rawUserGoal.trim() : "";
    if (rawUserGoal.length < 5) {
      json(res, 400, { error: "rawUserGoal must have at least 5 characters" });
      return;
    }
    const locale = body.locale === "en" || body.locale === "ru" ? body.locale : "sr";
    const intake = (await extractPlannerIntake(rawUserGoal, { locale })) as PlannerIntakeResult;
    const plannerPatch = mapIntakeToPlannerState(intake);
    json(res, 200, { intake, plannerPatch });
  } catch (error) {
    json(res, 500, {
      error: "planner-intake-failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
