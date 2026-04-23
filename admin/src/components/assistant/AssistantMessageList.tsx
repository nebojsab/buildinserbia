"use client";

import { AssistantAnswerCard } from "./AssistantAnswerCard";
import type { AssistantChatMessage } from "./types";
import type { AssistantLocale } from "@/lib/assistant/types";

export function AssistantMessageList({
  messages,
  locale,
}: {
  messages: AssistantChatMessage[];
  locale: AssistantLocale;
}) {
  return (
    <div style={{ display: "grid", gap: 9 }}>
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            key={message.id}
            style={{
              justifySelf: isUser ? "end" : "start",
              maxWidth: "92%",
              border: "1px solid var(--bdr)",
              borderRadius: 10,
              background: isUser ? "var(--accbg)" : "var(--card)",
              padding: "8px 10px",
            }}
          >
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink2)" }}>{message.text}</p>
            {!isUser && message.payload ? (
              <AssistantAnswerCard
                payload={message.payload}
                locale={locale}
                messageId={message.id}
                sourceQuestion={message.sourceQuestion}
                plannerContext={message.plannerContext}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
