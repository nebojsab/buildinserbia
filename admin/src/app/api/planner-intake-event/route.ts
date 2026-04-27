import { NextResponse } from "next/server";
import { isIntakeEventName, recordIntakeEvent } from "@shared/lib/planner-intake/eventStore";

type IntakeEventBody = {
  event?: string;
  ts?: number;
  locale?: "sr" | "en" | "ru";
  confidence?: number;
  parentCategory?: string;
  parentCategoryLabel?: string;
  taskCount?: number;
  taskKeys?: string[];
  taskLabels?: string[];
};

export async function POST(request: Request) {
  let payload: IntakeEventBody;
  try {
    payload = (await request.json()) as IntakeEventBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.event || !isIntakeEventName(payload.event)) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }

  const ts = typeof payload.ts === "number" && Number.isFinite(payload.ts) ? payload.ts : Date.now();
  recordIntakeEvent({
    event: payload.event,
    ts,
    locale: payload.locale,
    confidence: payload.confidence,
    parentCategory: payload.parentCategory,
    parentCategoryLabel: payload.parentCategoryLabel,
    taskCount: payload.taskCount,
    taskKeys: Array.isArray(payload.taskKeys) ? payload.taskKeys : undefined,
    taskLabels: Array.isArray(payload.taskLabels) ? payload.taskLabels : undefined,
  });

  return new NextResponse(null, { status: 204 });
}
