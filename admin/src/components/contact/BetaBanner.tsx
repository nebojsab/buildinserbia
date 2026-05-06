"use client";

import { useState, useEffect, useRef } from "react";

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const show = localStorage.getItem(STORAGE_KEY) !== "1";
    setVisible(show);
    if (!show) document.documentElement.style.setProperty("--banner-h", "0px");
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) {
      document.documentElement.style.setProperty("--banner-h", "0px");
      return;
    }
    const h = ref.current.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--banner-h", `${h}px`);
  }, [visible]);

  if (!visible) return null;

  const m = MESSAGES[lang] ?? MESSAGES.sr;

  return (
    <div
      ref={ref}
      className="beta-banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "#FDE047",
        color: "#134279",
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
            background: "transparent",
            border: "1.5px solid #134279",
            borderRadius: 6,
            color: "#134279",
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
            document.documentElement.style.setProperty("--banner-h", "0px");
            setVisible(false);
          }}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: "rgba(19,66,121,.5)",
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
