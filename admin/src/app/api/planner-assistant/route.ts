import { NextResponse } from "next/server";
import { classifyPlannerIntent } from "@/lib/assistant/plannerIntents";
import { retrievePlannerContext } from "@/lib/assistant/plannerRetrieval";
import { buildPlannerAssistantResponse } from "@/lib/assistant/plannerResponseBuilder";
import type { PlannerAssistantRequest, PlannerAssistantContext } from "@/lib/assistant/types";

function validLocale(locale: string): locale is PlannerAssistantContext["locale"] {
  return locale === "sr" || locale === "en" || locale === "ru";
}

export async function POST(request: Request) {
  let payload: PlannerAssistantRequest;
  try {
    payload = (await request.json()) as PlannerAssistantRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const message = String(payload.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  const context = payload.context;
  if (!context || !validLocale(context.locale) || !context.currentPage) {
    return NextResponse.json(
      { error: "Valid planner context is required." },
      { status: 400 },
    );
  }

  const intent = classifyPlannerIntent(message);
  const entries = retrievePlannerContext(context, message);
  const response = buildPlannerAssistantResponse(intent, context, entries);
  return NextResponse.json(response);
}
