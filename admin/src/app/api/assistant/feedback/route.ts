import { NextResponse } from "next/server";
import { storeAssistantFeedback } from "@/lib/assistant/feedbackStore";
import type { AssistantFeedbackRequest } from "@/lib/assistant/types";

export async function POST(request: Request) {
  let payload: AssistantFeedbackRequest;
  try {
    payload = (await request.json()) as AssistantFeedbackRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!payload.messageId || typeof payload.helpful !== "boolean" || !payload.intent) {
    return NextResponse.json(
      { error: "messageId, helpful and intent are required." },
      { status: 400 },
    );
  }

  const result = await storeAssistantFeedback(payload);
  return NextResponse.json({
    ok: true,
    stored: result.stored,
    path: result.path,
  });
}
