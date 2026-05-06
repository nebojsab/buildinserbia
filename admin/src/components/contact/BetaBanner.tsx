"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "bis-beta-banner-dismissed";

const MESSAGES = {
  sr: {
    text: "Sajt je u aktivnom razvoju — sadržaj se stalno poboljšava.",
    cta: "Pišite nam ideje i predloge →",
  },
  en: {
    text: "Site is actively being built — content is constantly improving.",
    cta: "Send us your ideas and suggestions →",
  },
  ru: {
    text: "Сайт находится в активной разработке — контент постоянно улучшается.",
    cta: "Напишите нам идеи и предложения →",
  },
};

type Lang = "sr" | "en" | "ru";

export function BetaBanner({ lang, onContact }: { lang: Lang; onContact: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!visible) return null;

  const m = MESSAGES[lang] ?? MESSAGES.sr;

  return (
    <div
      className="beta-banner"
      style={{
        background: "#FDE047",
        color: "#1a1a1a",
        padding: "7px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12.5,
        lineHeight: 1.4,
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>{m.text}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onContact}
          style={{
            background: "rgba(0,0,0,.12)",
            border: "1px solid rgba(0,0,0,.2)",
            borderRadius: 6,
            color: "#1a1a1a",
            fontSize: 11.5,
            fontWeight: 600,
            padding: "4px 10px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "var(--sans)",
          }}
        >
          {m.cta}
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: "rgba(0,0,0,.45)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
