import { NextResponse } from "next/server";
import { classifyIntent } from "@/lib/assistant/intents";
import { retrieveContext } from "@/lib/assistant/retrieval";
import { buildAssistantResponse } from "@/lib/assistant/responseBuilder";
import type { AssistantLocale, AssistantRequest } from "@/lib/assistant/types";

function toLocale(input: string | undefined): AssistantLocale {
  if (input === "en" || input === "ru" || input === "sr") return input;
  return "sr";
}

export async function POST(request: Request) {
  let payload: AssistantRequest;
  try {
    payload = (await request.json()) as AssistantRequest;
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

  const locale = toLocale(payload.locale);
  const intent = classifyIntent(message);
  const retrieval = retrieveContext(locale, intent, message);
  const response = buildAssistantResponse(intent, locale, retrieval);

  return NextResponse.json(response);
}
