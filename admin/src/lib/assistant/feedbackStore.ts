import { put } from "@vercel/blob";
import type { AssistantFeedbackRequest } from "./types";

type AssistantFeedbackLogEntry = AssistantFeedbackRequest & {
  timestamp: string;
  source: "site-assistant-ui";
};

export async function storeAssistantFeedback(
  payload: AssistantFeedbackRequest,
): Promise<{ stored: boolean; path?: string }> {
  const entry: AssistantFeedbackLogEntry = {
    ...payload,
    timestamp: new Date().toISOString(),
    source: "site-assistant-ui",
  };

  const key = `assistant/feedback/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.json`;

  try {
    await put(key, JSON.stringify(entry, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json; charset=utf-8",
    });
    return { stored: true, path: key };
  } catch {
    console.info("[assistant-feedback-fallback]", entry);
    return { stored: false };
  }
}
