import { NextResponse } from "next/server";
import { extractPlannerIntake } from "@shared/lib/planner-intake/extractGoal";
import { mapIntakeToPlannerState } from "@shared/lib/planner-intake/mapToPlannerState";

type PlannerIntakeRequest = {
  rawUserGoal?: string;
  locale?: "sr" | "en" | "ru";
};

export async function POST(request: Request) {
  let payload: PlannerIntakeRequest;
  try {
    payload = (await request.json()) as PlannerIntakeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const rawUserGoal = String(payload.rawUserGoal ?? "").trim();
  if (rawUserGoal.length < 5) {
    return NextResponse.json(
      { error: "rawUserGoal must have at least 5 characters." },
      { status: 400 },
    );
  }

  const locale = payload.locale === "en" || payload.locale === "ru" ? payload.locale : "sr";

  try {
    const intake = await extractPlannerIntake(rawUserGoal, { locale });
    const plannerPatch = mapIntakeToPlannerState(intake);
    return NextResponse.json({ intake, plannerPatch });
  } catch (error) {
    return NextResponse.json(
      {
        error: "planner-intake-failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
