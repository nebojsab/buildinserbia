import { useEffect, useRef, useState } from "react";
import type { Lang } from "../translations";

const FLAGS: Record<Lang, string> = { sr: "🇷🇸", en: "🇬🇧", ru: "🇷🇺" };
const LABELS: Record<Lang, string> = {
  sr: "SR — Srpski",
  en: "EN — English",
  ru: "RU — Русский",
};

export function LangSwitch({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="lang-wrap">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 12px",
          border: "1.5px solid var(--bdr)",
          borderRadius: "var(--r)",
          background: "var(--card)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ink2)",
          cursor: "pointer",
          transition: "border-color .15s",
          fontFamily: "var(--sans)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--bdr2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--bdr)";
        }}
      >
        <span>{FLAGS[lang]}</span>
        <span>{lang.toUpperCase()}</span>
        <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 2 }}>▾</span>
      </button>
      {open && (
        <div className="lang-menu">
          {(["sr", "en", "ru"] as const).map((l) => (
            <button
              type="button"
              key={l}
              className={`lang-btn${l === lang ? " active" : ""}`}
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
            >
              <span style={{ fontSize: 15 }}>{FLAGS[l]}</span>
              <span>{LABELS[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
