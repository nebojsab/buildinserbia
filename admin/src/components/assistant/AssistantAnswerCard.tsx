"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  AssistantLocale,
  AssistantResponse,
  PlannerAssistantContext,
} from "@/lib/assistant/types";
import { AssistantDisclaimer } from "./AssistantDisclaimer";

export function AssistantAnswerCard({
  payload,
  locale,
  messageId,
  sourceQuestion,
  plannerContext,
}: {
  payload: AssistantResponse;
  locale: AssistantLocale;
  messageId: string;
  sourceQuestion?: string;
  plannerContext?: PlannerAssistantContext;
}) {
  const [feedbackSent, setFeedbackSent] = useState<"up" | "down" | null>(null);
  const hasResources =
    payload.internalLinks.length > 0 || payload.externalLinks.length > 0;

  async function onFeedback(helpful: boolean) {
    setFeedbackSent(helpful ? "up" : "down");
    try {
      await fetch("/api/assistant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          helpful,
          locale,
          intent: payload.intent,
          question: sourceQuestion,
          answer: payload.answer,
          currentPage:
            typeof window !== "undefined" ? window.location.pathname : undefined,
          currentHash:
            typeof window !== "undefined" ? window.location.hash : undefined,
          plannerContext,
        }),
      });
    } catch {
      // Ignore feedback transport errors for MVP.
    }
  }

  return (
    <div
      style={{
        marginTop: 8,
        border: "1px solid var(--bdr)",
        borderRadius: 10,
        background: "var(--card)",
        padding: "10px 11px",
      }}
    >
      {hasResources ? (
        <>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)" }}>Resources</p>
          <div style={{ marginTop: 7, display: "grid", gap: 6 }}>
            {payload.internalLinks.map((link) => (
              <Link key={link.id} href={link.path} style={{ fontSize: 12, color: "var(--acc)" }}>
                {link.title}
              </Link>
            ))}
            {payload.externalLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: "var(--blu)" }}
              >
                {link.title}
              </a>
            ))}
          </div>
        </>
      ) : null}
      <AssistantDisclaimer items={payload.disclaimers} />
      <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
        <button
          type="button"
          className="btn-g"
          style={{ padding: "5px 8px", fontSize: 11.5 }}
          onClick={() => void onFeedback(true)}
          disabled={feedbackSent !== null}
        >
          {feedbackSent === "up" ? "✓ Helpful" : "Helpful"}
        </button>
        <button
          type="button"
          className="btn-g"
          style={{ padding: "5px 8px", fontSize: 11.5 }}
          onClick={() => void onFeedback(false)}
          disabled={feedbackSent !== null}
        >
          {feedbackSent === "down" ? "✓ Not helpful" : "Not helpful"}
        </button>
      </div>
    </div>
  );
}
