"use client";

import type {
  AssistantLocale,
  AssistantResponse,
  PlannerAssistantContext,
} from "@/lib/assistant/types";

export type AssistantRole = "user" | "assistant";

export type AssistantChatMessage = {
  id: string;
  role: AssistantRole;
  text: string;
  payload?: AssistantResponse;
  sourceQuestion?: string;
  plannerContext?: PlannerAssistantContext;
};

export type AssistantUIProps = {
  locale: AssistantLocale;
};
