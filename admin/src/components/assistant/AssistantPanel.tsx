"use client";

import { useMemo, useState } from "react";
import type {
  AssistantLocale,
  AssistantResponse,
  PlannerAssistantContext,
  PlannerAssistantResponse,
} from "@/lib/assistant/types";
import { AssistantWelcome } from "./AssistantWelcome";
import { QuickActionChips } from "./QuickActionChips";
import { AssistantMessageList } from "./AssistantMessageList";
import { AssistantInput } from "./AssistantInput";
import type { AssistantChatMessage } from "./types";

declare global {
  interface Window {
    __buildInSerbiaPlannerContext?: PlannerAssistantContext;
  }
}

function quickActionsForLocale(locale: AssistantLocale): string[] {
  if (locale === "en") {
    return [
      "How does Planner work?",
      "Help me find documents",
      "Show FAQ",
      "Show trusted official links",
    ];
  }
  if (locale === "ru") {
    return [
      "Как работает Planner?",
      "Помоги найти документы",
      "Покажи FAQ",
      "Покажи официальные источники",
    ];
  }
  return [
    "Kako funkcioniše Planner?",
    "Pomozi mi oko dokumenata",
    "Gde su FAQ odgovori?",
    "Koji su provereni zvanični linkovi?",
  ];
}

function getPlannerContext(panelLocale: AssistantLocale): PlannerAssistantContext | null {
  if (typeof window === "undefined") return null;
  const inPlannerPage =
    window.location.pathname === "/" && window.location.hash.includes("planner");
  if (!inPlannerPage) return null;

  const external = window.__buildInSerbiaPlannerContext;
  if (!external) {
    return {
      locale: panelLocale,
      currentPage: window.location.pathname,
      selectedTasks: [],
      visibleFields: [],
      partiallyFilledValues: {},
      estimateModeByTask: {},
    };
  }

  return {
    locale: external.locale ?? panelLocale,
    currentPage: window.location.pathname,
    currentStep: external.currentStep,
    selectedProjectType: external.selectedProjectType,
    selectedTasks: external.selectedTasks ?? [],
    visibleFields: external.visibleFields ?? [],
    partiallyFilledValues: external.partiallyFilledValues ?? {},
    estimateModeByTask: external.estimateModeByTask ?? {},
  };
}

export function AssistantPanel({
  locale,
  open,
  onClose,
}: {
  locale: AssistantLocale;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const quickActions = useMemo(() => quickActionsForLocale(locale), [locale]);

  async function sendMessage(message: string) {
    const plannerContext = getPlannerContext(locale);
    const isPlannerContext = Boolean(plannerContext);
    const userMessage: AssistantChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "user",
      text: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        isPlannerContext ? "/api/planner-assistant" : "/api/assistant",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: isPlannerContext
            ? JSON.stringify({ message, context: plannerContext })
            : JSON.stringify({ message, locale }),
        },
      );
      if (!response.ok) throw new Error("assistant-request-failed");
      const raw = (await response.json()) as
        | AssistantResponse
        | PlannerAssistantResponse;
      const payload: AssistantResponse = isPlannerContext
        ? {
            intent: raw.intent as AssistantResponse["intent"],
            answer: raw.answer,
            confidence: raw.confidence,
            internalLinks: [],
            externalLinks: [],
            disclaimers: raw.disclaimers,
            suggestedQuestions: raw.suggestedQuestions,
          }
        : (raw as AssistantResponse);
      const assistantMessage: AssistantChatMessage = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        text: payload.answer,
        payload,
        sourceQuestion: message,
        plannerContext: plannerContext ?? undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError(
        locale === "sr"
          ? "Došlo je do greške. Pokušajte ponovo."
          : locale === "en"
            ? "Something went wrong. Please try again."
            : "Произошла ошибка. Попробуйте еще раз.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        pointerEvents: open ? "auto" : "none",
      }}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close assistant"
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          background: open ? "rgba(24,24,27,.36)" : "transparent",
          opacity: open ? 1 : 0,
          transition: "opacity .2s",
        }}
      />
      <aside
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "min(420px, 100vw)",
          background: "var(--card)",
          borderLeft: "1px solid var(--bdr)",
          boxShadow: "var(--sh2)",
          transform: open ? "translateX(0)" : "translateX(102%)",
          transition: "transform .22s cubic-bezier(.22,1,.36,1)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bdr)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>BuildInSerbia Assistant</p>
          <button type="button" className="btn-g" style={{ padding: "6px 10px", fontSize: 12 }} onClick={onClose}>
            {locale === "en" ? "Close" : locale === "ru" ? "Закрыть" : "Zatvori"}
          </button>
        </div>
        <div style={{ padding: "12px", overflowY: "auto", display: "grid", gap: 10, alignContent: "start" }}>
          <AssistantWelcome locale={locale} />
          {messages.length === 0 ? (
            <QuickActionChips items={quickActions} onSelect={(value) => void sendMessage(value)} />
          ) : null}
          <AssistantMessageList messages={messages} locale={locale} />
          {error ? <p style={{ fontSize: 12, color: "#991B1B" }}>{error}</p> : null}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid var(--bdr)" }}>
          <AssistantInput loading={loading} locale={locale} onSubmit={(value) => void sendMessage(value)} />
        </div>
      </aside>
    </div>
  );
}
