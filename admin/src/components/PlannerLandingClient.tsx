"use client";

import { PlannerWizard } from "@/planner/wizard";
import { SiteLogo } from "@shared/components/SiteLogo";

type LangCode = "sr" | "en" | "ru";

const CONTENT: Record<string, Record<LangCode, { h1: string; intro: string }>> = {
  reno: {
    sr: {
      h1: "Koliko košta renovacija?",
      intro: "Unesite detalje projekta i dobijte okvirnu procenu troškova radova za vašu lokaciju — za 3 minuta, pre prvog poziva izvođaču.",
    },
    en: {
      h1: "How much does renovation cost?",
      intro: "Enter your project details and get a rough labour cost estimate for your location — in 3 minutes, before your first contractor call.",
    },
    ru: {
      h1: "Сколько стоит ремонт?",
      intro: "Введите детали проекта и получите приблизительную оценку стоимости работ для вашего местоположения — за 3 минуты.",
    },
  },
  newbuild: {
    sr: {
      h1: "Šta vas čeka pri izgradnji kuće?",
      intro: "Plan troškova gradnje, lista dozvola i projektne dokumentacije — pre prvog razgovora sa arhitektom ili izvođačem.",
    },
    en: {
      h1: "Planning a new build?",
      intro: "Construction cost plan, permit checklist and required documents — before your first conversation with an architect or contractor.",
    },
    ru: {
      h1: "Что вас ждёт при строительстве дома?",
      intro: "План затрат на строительство, список разрешений и проектной документации — до первого разговора с архитектором.",
    },
  },
  extension: {
    sr: {
      h1: "Procena za dogradnju ili nadogradnju",
      intro: "Troškovi dogradnje objekta, neophodne dozvole i lokalni kontakti — unesite detalje i dobijte konkretan plan.",
    },
    en: {
      h1: "Extension or loft conversion estimate",
      intro: "Costs for extending your property, required permits and local contacts — enter your details for a concrete plan.",
    },
    ru: {
      h1: "Оценка пристройки или надстройки",
      intro: "Затраты на расширение объекта, необходимые разрешения и местные контакты — введите детали и получите конкретный план.",
    },
  },
  yard: {
    sr: {
      h1: "Uređenje dvorišta — plan i troškovi",
      intro: "Procena troškova uređenja dvorišta, terase, ograde ili bazena za vašu lokaciju.",
    },
    en: {
      h1: "Garden & yard — cost plan",
      intro: "Cost estimate for landscaping, decking, fencing or a pool for your location.",
    },
    ru: {
      h1: "Благоустройство двора — план и стоимость",
      intro: "Оценка стоимости благоустройства двора, террасы, забора или бассейна для вашего местоположения.",
    },
  },
};

type Props = {
  projectType: string;
  lang: string;
};

export function PlannerLandingClient({ projectType, lang }: Props) {
  const l: LangCode = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
  const content = CONTENT[projectType]?.[l] ?? CONTENT[projectType]?.["sr"];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      {/* Minimal nav */}
      <header style={{
        borderBottom: "1px solid var(--bdr)",
        background: "var(--card)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}>
        <a href={`/?lang=${lang}`} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <SiteLogo />
        </a>
        <a
          href={`/?lang=${lang}`}
          style={{ fontSize: "0.8125rem", color: "var(--ink3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
        >
          ← {l === "sr" ? "Nazad" : l === "ru" ? "Назад" : "Back"}
        </a>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px 80px" }}>
        {content && (
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "var(--heading)",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 700,
              color: "var(--ink)",
              lineHeight: 1.2,
              margin: "0 0 12px",
              letterSpacing: "-.01em",
            }}>
              {content.h1}
            </h1>
            <p style={{ margin: 0, fontSize: "1rem", color: "var(--ink3)", lineHeight: 1.6, maxWidth: 560 }}>
              {content.intro}
            </p>
          </div>
        )}

        <div className="card" style={{ padding: "28px 24px" }}>
          <PlannerWizard lang={lang} initialProjectType={projectType} />
        </div>
      </main>
    </div>
  );
}
