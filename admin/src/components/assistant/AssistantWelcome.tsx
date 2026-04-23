"use client";

import type { AssistantLocale } from "@/lib/assistant/types";

export function AssistantWelcome({ locale }: { locale: AssistantLocale }) {
  const title =
    locale === "sr"
      ? "BuildInSerbia helper"
      : locale === "en"
        ? "BuildInSerbia helper"
        : "BuildInSerbia помощник";
  const body =
    locale === "sr"
      ? "Pomažem oko snalaženja kroz sajt, Planner-a, FAQ-a i dokumenata."
      : locale === "en"
        ? "I can help with site navigation, Planner, FAQ, and documents."
        : "Я помогаю с навигацией по сайту, Planner, FAQ и документами.";

  return (
    <div
      style={{
        border: "1px solid var(--bdr)",
        borderRadius: "var(--r)",
        background: "var(--bgw)",
        padding: "10px 12px",
      }}
    >
      <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink)" }}>{title}</p>
      <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--ink3)", lineHeight: 1.5 }}>{body}</p>
    </div>
  );
}
