"use client";

import { useEffect, useLayoutEffect, useRef, useState, Suspense } from "react";
import type { CSSProperties } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";

import { translations, type Lang } from "@shared/translations";
import { AFF } from "@shared/constants/affiliate";
import { fetchMaintenance, type MaintenancePayload } from "@shared/api/maintenance";
import { getPublicPreviewBypassFromWindow } from "@shared/lib/publicPreviewBypass";
import { FAQ } from "@shared/components/FAQ";
import { BackToTop } from "@shared/components/BackToTop";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteLogo } from "@shared/components/SiteLogo";
import { ComingSoonScreen, MaintenanceScreen } from "@shared/components/SystemStateScreens";
import { Ey, HR } from "@shared/components/ui";
import { PlannerWizard } from "@/planner/wizard";
import { WizardIcon } from "@/planner/wizard/WizardIcon";

const HeroPlanVisual = dynamic(
  () => import("@shared/components/HeroPlanVisual").then((m) => ({ default: m.HeroPlanVisual })),
  { ssr: false }
);

const MISTAKE_ICONS: Array<{ name: string; color: string }> = [
  { name: "triangle",   color: "#B45309" },
  { name: "zap",        color: "#134279" },
  { name: "layers",     color: "#166534" },
  { name: "building",   color: "#134279" },
  { name: "file-text",  color: "#6D28D9" },
];

const TRUST_ICONS = ["home", "sun", "file-text", "shield"] as const;

const LANG_OPTIONS: { value: Lang; flag: string; label: string }[] = [
  { value: "sr", flag: "🇷🇸", label: "Srpski" },
  { value: "en", flag: "🇬🇧", label: "English" },
  { value: "ru", flag: "🇷🇺", label: "Русский" },
];

function LangDropdown({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const current = LANG_OPTIONS.find((o) => o.value === lang)!;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "1.5px solid var(--acc)", background: "var(--card)", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: 700, color: "var(--acc)", letterSpacing: ".04em", whiteSpace: "nowrap" }}
      >
        <span>{current.flag}</span>
        <span>{current.value.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 2, transition: "transform .15s", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.10)", zIndex: 9999, minWidth: 180, overflow: "hidden" }}>
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: opt.value === lang ? 700 : 500, color: opt.value === lang ? "var(--acc)" : "var(--ink)", textAlign: "left" }}
            >
              <span style={{ fontSize: 16 }}>{opt.flag}</span>
              <span>{opt.value.toUpperCase()} — {opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialLang = (searchParams.get("lang") as Lang | null) ?? "sr";
  const [lang, setLang] = useState<Lang>(
    ["sr", "en", "ru"].includes(initialLang) ? initialLang : "sr"
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const MISTAKES_IMAGE_SRC = "/api/assets/mistakes-image";
  const [maint, setMaint] = useState<MaintenancePayload | null>(null);
  const previewBypassRef = useRef<boolean>(false);
  const [previewBypass, setPreviewBypass] = useState(false);
  const [gateLoading, setGateLoading] = useState(true);

  const t = translations[lang];
  const plannerNote = "note" in t.planner ? (t.planner as { note?: string }).note : undefined;
  const foreignerBlock = "foreignerBlock" in t ? t.foreignerBlock : undefined;
  const docsLabel = lang === "sr" ? "Dokumenti" : lang === "ru" ? "Документы" : "Documents";
  const blogLabel = lang === "sr" ? "Blog" : lang === "ru" ? "Блог" : "Blog";

  useEffect(() => {
    const bypass = getPublicPreviewBypassFromWindow();
    previewBypassRef.current = bypass;
    setPreviewBypass(bypass);

    let cancelled = false;
    const reload = async () => {
      try {
        const data = await fetchMaintenance();
        if (!cancelled) setMaint(data);
      } finally {
        if (!cancelled) setGateLoading(false);
      }
    };
    void reload();
    const onVisible = () => { if (document.visibilityState === "visible") void reload(); };
    const onFocus = () => void reload();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [previewBypass]);

  function handleSetLang(l: Lang) {
    setLang(l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    router.replace(url.pathname + "?" + url.searchParams.toString(), { scroll: false });
  }

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const PY = "96px 24px";
  const MX = { maxWidth: 1100, margin: "0 auto" };

  const previewBypassEffective = previewBypass || maint?.previewBypass === true;

  if (gateLoading && !previewBypass) {
    return <div style={{ background: "var(--bg)", minHeight: "100vh" }} />;
  }
  if (maint && !previewBypassEffective) {
    if (maint.mode === "COMING_SOON") {
      return <ComingSoonScreen lang={lang} status={maint} setLang={handleSetLang} />;
    }
    if (maint.mode === "MAINTENANCE") {
      return <MaintenanceScreen lang={lang} status={maint} setLang={handleSetLang} />;
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── NAV (sticky) ── */}
      <div style={{ position: "sticky", top: "var(--banner-h, 0px)" as string, zIndex: 100 }}>
      <header style={{ background: "rgba(250,250,249,.94)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--bdr)" }}>
        <div style={{ ...MX, padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <SiteLogo priority />
          </div>
          <nav className="hide-xs" style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {(["how", "planner", "faq"] as const).map((id, i) => (
              <button key={id} className="nav-lnk" onClick={() => scrollTo(id)}>
                {t.nav.links[i]}
              </button>
            ))}
            <a href={`/documents?lang=${lang}`} className="nav-lnk">{docsLabel}</a>
            <a href={`/blog?lang=${lang}`} className="nav-lnk">{blogLabel}</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <LangDropdown lang={lang} onChange={handleSetLang} />
            <button className="btn-p hide-xs" onClick={() => scrollTo("planner")} style={{ fontSize: 13, padding: "9px 18px" }}>{t.nav.cta}</button>
            {/* Hamburger — mobile only */}
            <button
              type="button"
              className="pc-hamburger"
              aria-label={mobileMenuOpen ? "Zatvori meni" : "Otvori meni"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
              style={{ display: "none", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 5, width: 40, height: 40, border: "1.5px solid var(--bdr)", borderRadius: "var(--r)", background: "var(--card)", cursor: "pointer", padding: 0 }}
            >
              <span style={{ display: "block", width: 18, height: 1.5, background: "var(--ink2)", borderRadius: 2, transition: "transform .2s", transform: mobileMenuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 18, height: 1.5, background: "var(--ink2)", borderRadius: 2, transition: "opacity .2s", opacity: mobileMenuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 18, height: 1.5, background: "var(--ink2)", borderRadius: 2, transition: "transform .2s", transform: mobileMenuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div style={{ borderTop: "1px solid var(--bdr)", background: "rgba(250,250,249,.98)", padding: "8px 0 16px" }}>
            {(["how", "planner", "faq"] as const).map((id, i) => (
              <button key={id} onClick={() => { scrollTo(id); setMobileMenuOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 24px", fontSize: 15, fontWeight: 500, color: "var(--ink2)", fontFamily: "var(--sans)", background: "none", border: "none", cursor: "pointer" }}>
                {t.nav.links[i]}
              </button>
            ))}
            <a href={`/documents?lang=${lang}`} onClick={() => setMobileMenuOpen(false)}
              style={{ display: "block", padding: "13px 24px", fontSize: 15, fontWeight: 500, color: "var(--ink2)", fontFamily: "var(--sans)" }}>{docsLabel}</a>
            <a href={`/blog?lang=${lang}`} onClick={() => setMobileMenuOpen(false)}
              style={{ display: "block", padding: "13px 24px", fontSize: 15, fontWeight: 500, color: "var(--ink2)", fontFamily: "var(--sans)" }}>{blogLabel}</a>
            <div style={{ padding: "8px 24px 0" }}>
              <button className="btn-p" onClick={() => { scrollTo("planner"); setMobileMenuOpen(false); }} style={{ width: "100%", fontSize: 14, padding: "11px 18px", justifyContent: "center" }}>{t.nav.cta}</button>
            </div>
          </div>
        )}
      </header>
      </div>

      {/* ── HERO ── */}
      <section style={{ padding: "80px 24px 64px", background: "linear-gradient(175deg,#FDFBF8 0%,var(--bg) 100%)", borderBottom: "1px solid var(--bdr)" }}>
        <div style={{ ...MX }}>
          <div className="hero-g" style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 68, alignItems: "center" }}>
            <div className="fu">
              <p className="eyebrow" style={{ marginBottom: 16 }}>{t.hero.eyebrow}</p>
              <h1 style={{ fontFamily: "var(--heading)", fontSize: "clamp(30px,4.2vw,50px)", fontWeight: 500, lineHeight: 1.13, letterSpacing: "-.02em", marginTop: 0, marginBottom: 22 }}>
                <span style={{ display: "block", color: "var(--ink)", marginBottom: 6 }}>{t.hero.title}</span>
                <span style={{ display: "block", color: "var(--acc)", fontWeight: 400, fontStyle: "italic" }}>{t.hero.accent}</span>
              </h1>
              <p style={{ fontSize: 16, color: "var(--ink3)", lineHeight: 1.72, maxWidth: 490, marginBottom: 24, fontFamily: "var(--sans)" }}>{t.hero.sub}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--accbg)", border: "1px solid var(--accmid)", borderRadius: 8, padding: "8px 15px", marginBottom: 26 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: "var(--accmid)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)", flexShrink: 0 }}>
                  <WizardIcon name="zap" size={13} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--acc)", fontFamily: "var(--sans)" }}>{t.hero.preview}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <button className="btn-p" onClick={() => scrollTo("planner")} style={{ fontSize: 15, padding: "13px 28px" }}>{t.hero.cta} →</button>
              </div>
              <p style={{ fontSize: 12, color: "var(--ink4)", fontFamily: "var(--sans)", marginBottom: 24 }}>{t.hero.ctaNote}</p>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", fontFamily: "var(--sans)" }}>{t.hero.trustBar.label}</span>
                {t.hero.trustBar.items.map((item, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "var(--ink2)", background: "var(--bgw)", border: "1px solid var(--bdr)", borderRadius: 20, padding: "3px 11px", fontFamily: "var(--sans)" }}>
                    <span style={{ color: "var(--grn)", fontSize: 10 }}>●</span> {item}
                  </span>
                ))}
              </div>
            </div>
            <HeroPlanVisual lang={lang} />
          </div>
        </div>
      </section>

      {/* ── COMMON MISTAKES ── */}
      {t.mistakes && (
        <section style={{ padding: "72px 24px", background: "var(--bgw)", borderBottom: "1px solid var(--bdr)" }}>
          <div style={{ ...MX }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "end" }} className="plan-g">
              <div>
                <Ey>{t.mistakes.eyebrow}</Ey>
                <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 14 }}>
                  {t.mistakes.title}
                </h2>
                <p style={{ fontSize: 14.5, color: "var(--ink3)", lineHeight: 1.7, fontFamily: "var(--sans)", marginBottom: 22 }}>{t.mistakes.sub}</p>
                <div className="mistakes-glb fu3" style={{ width: "100%", aspectRatio: "1 / 1", maxWidth: 480, borderRadius: "var(--rl)", border: "1px solid var(--bdr)", boxShadow: "var(--sh1)", background: "linear-gradient(165deg, #FBF9F6 0%, #EFEBE5 55%, var(--card) 100%)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={MISTAKES_IMAGE_SRC} alt="Common construction mistakes visual"
                    onError={(e) => {
                      const stage = e.currentTarget.getAttribute("data-fallback-stage") ?? "0";
                      if (stage === "0") { e.currentTarget.setAttribute("data-fallback-stage", "1"); e.currentTarget.src = "/mistakes-static-image.webp"; return; }
                      e.currentTarget.onerror = null; e.currentTarget.src = "/Logo.svg";
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <p style={{ fontSize: 13.5, color: "var(--ink2)", fontFamily: "var(--sans)", lineHeight: 1.55, marginBottom: 14, fontWeight: 500 }}>{t.mistakes.listIntro}</p>
                {t.mistakes.items.map((it, i) => {
                  const mi = MISTAKE_ICONS[i] ?? MISTAKE_ICONS[0];
                  return (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 0", borderBottom: i < t.mistakes.items.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: "var(--r)", background: `${mi.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: mi.color, marginTop: 1 }}>
                      <WizardIcon name={mi.name} size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4, marginTop: 0, fontFamily: "var(--sans)" }}>{it.t}</h3>
                      <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.65, fontFamily: "var(--sans)" }}>{it.d}</p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 36, padding: "20px 24px", background: "var(--accbg)", border: "1px solid var(--accmid)", borderRadius: "var(--r)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--sans)", lineHeight: 1.5, maxWidth: 520 }}>{t.mistakes.bottomCta}</p>
              <button className="btn-p" onClick={() => scrollTo("planner")} style={{ fontSize: 14, flexShrink: 0 }}>{t.hero.cta} →</button>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: PY }}>
        <div style={{ ...MX }}>
          <Ey>{t.how.eyebrow}</Ey>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 48 }}>
            {t.how.title}
          </h2>
          <div className="how-g" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {t.how.steps.map((s, i) => (
              <div key={i} className="card card-h" style={{ padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--acc)", fontFamily: "var(--sans)", letterSpacing: ".04em" }}>{s.n}</span>
                  <div style={{ flex: 1, height: 1, background: "var(--bdr)" }} />
                </div>
                <h3 style={{ fontFamily: "var(--heading)", fontSize: 17, fontWeight: 500, color: "var(--ink)", marginBottom: 10, lineHeight: 1.35 }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: "var(--ink3)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── PLANNER WIZARD ── */}
      <section id="planner" style={{ padding: PY, background: "linear-gradient(180deg,#F8F5F2 0%,var(--bg) 100%)" }}>
        <div style={{ ...MX }}>
          <Ey>{t.planner.eyebrow}</Ey>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 32 }}>
            {t.planner.title}
          </h2>
          <div className="plan-g" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 26, alignItems: "start" }}>
            <div className="card" style={{ padding: 34 }}>
              <PlannerWizard lang={lang} />
            </div>
            <div className="planner-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: "22px 24px", background: "var(--accbg)", borderColor: "var(--accmid)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--acc)", marginBottom: 14, fontFamily: "var(--sans)" }}>
                  {lang === "sr" ? "Šta ćete dobiti" : lang === "ru" ? "Что вы получите" : "What you'll receive"}
                </p>
                {[
                  lang === "sr" ? "Konkretan plan za vaše radove" : lang === "ru" ? "Конкретный план для ваших работ" : "A concrete plan for your works",
                  lang === "sr" ? "Pregled svih kategorija i detalja" : lang === "ru" ? "Обзор всех категорий и деталей" : "Overview of all categories and details",
                  lang === "sr" ? "Lokacijski kontakti i preporuke" : lang === "ru" ? "Местные контакты и рекомендации" : "Local contacts and recommendations",
                  lang === "sr" ? "Preporuke za materijale" : lang === "ru" ? "Рекомендации по материалам" : "Material recommendations",
                ].map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: 11, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--acc)", fontWeight: 700, lineHeight: "20px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.55, fontFamily: "var(--sans)" }}>{g}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: "20px 24px", background: "var(--blubg)", borderColor: "var(--blumid)" }}>
                <p style={{ fontSize: 12.5, color: "var(--blu)", lineHeight: 1.65, fontFamily: "var(--sans)" }}>
                  <strong style={{ display: "block", marginBottom: 4, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>
                    {lang === "sr" ? "Napomena" : lang === "ru" ? "Примечание" : "Note"}
                  </strong>
                  {plannerNote ?? (lang === "sr" ? "Procena je informativna. Za konačnu cenu angažujte lokalne izvođače." : lang === "ru" ? "Оценка носит информационный характер. Для окончательной цены обратитесь к местным подрядчикам." : "Estimates are indicative. Engage local contractors for final pricing.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HR />

      {/* ── FOREIGNER BLOCK (EN + RU only) ── */}
      {lang !== "sr" && foreignerBlock && (
        <>
          <section style={{ padding: PY }}>
            <div style={{ ...MX }}>
              <div style={{ background: "var(--blubg)", border: "1px solid var(--blumid)", borderRadius: "var(--rxl)", padding: "34px 38px" }}>
                <Ey>{foreignerBlock.eyebrow}</Ey>
                <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 500, color: "var(--blu)", lineHeight: 1.3, letterSpacing: "-.01em", marginBottom: 8 }}>
                  {foreignerBlock.title}
                </h2>
                <p style={{ fontSize: 14, color: "var(--blu)", opacity: .7, marginBottom: 26, fontFamily: "var(--sans)", lineHeight: 1.6 }}>{foreignerBlock.sub}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="res-2col">
                  {foreignerBlock.items.map((it: { icon: string; t: string; d: string }, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{it.icon}</span>
                      <div>
                        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--blu)", marginBottom: 5, marginTop: 0, fontFamily: "var(--sans)" }}>{it.t}</h3>
                        <p style={{ fontSize: 13, color: "var(--blu)", opacity: .7, lineHeight: 1.65, fontFamily: "var(--sans)" }}>{it.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <HR />
        </>
      )}

      {/* ── RESOURCES ── */}
      {(() => {
        const REC_GROUPS: Record<Lang, { label: string; keys: string[]; recommended: string[] }[]> = {
          sr: [
            { label: "Materijali i konstrukcija", keys: ["insulation", "windows", "heating"], recommended: ["windows", "insulation"] },
            { label: "Enterijer i oprema", keys: ["flooring", "lighting", "bathroom", "kitchen", "furniture"], recommended: ["flooring", "kitchen"] },
            { label: "Eksterijer i dvorište", keys: ["garden", "tools"], recommended: [] },
          ],
          en: [
            { label: "Materials & structure", keys: ["insulation", "windows", "heating"], recommended: ["windows", "insulation"] },
            { label: "Interior & equipment", keys: ["flooring", "lighting", "bathroom", "kitchen", "furniture"], recommended: ["flooring", "kitchen"] },
            { label: "Exterior & garden", keys: ["garden", "tools"], recommended: [] },
          ],
          ru: [
            { label: "Материалы и конструкция", keys: ["insulation", "windows", "heating"], recommended: ["windows", "insulation"] },
            { label: "Интерьер и оборудование", keys: ["flooring", "lighting", "bathroom", "kitchen", "furniture"], recommended: ["flooring", "kitchen"] },
            { label: "Экстерьер и сад", keys: ["garden", "tools"], recommended: [] },
          ],
        };
        const groups = REC_GROUPS[lang];
        const ctaLabel = lang === "sr" ? "Istraži" : lang === "en" ? "Explore" : "Перейти";
        const recLabel = lang === "sr" ? "Preporučeno" : lang === "en" ? "Recommended" : "Рекомендуем";
        const heading = lang === "sr" ? "Korisne kategorije za vaš projekat" : lang === "en" ? "Useful categories for your project" : "Полезные категории для вашего проекта";
        const sub = lang === "sr" ? "Pažljivo odabrane kategorije materijala, opreme i usluga. Neke veze su partnerske — to jasno označavamo." : lang === "en" ? "Carefully selected material, equipment and service categories. Where links are referral-based, we say so clearly." : "Тщательно подобранные категории материалов и оборудования. Партнёрские ссылки всегда отмечаются.";
        const eyebrow = lang === "sr" ? "Resursi" : lang === "en" ? "Resources" : "Ресурсы";

        const leftGroup = groups[0];
        const rightGroups = groups.slice(1);

        const RecRow = ({ k, recommended }: { k: string; recommended: string[] }) => {
          const a = AFF[k];
          const sr = t.stageRecs[k as keyof typeof t.stageRecs];
          if (!a || !sr) return null;
          const isRec = recommended.includes(k);
          return (
            <a href={a.href} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "17px 20px", borderBottom: "1px solid var(--bdr)", transition: "background .15s", cursor: "pointer", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bgw)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <img src={a.image} alt="" aria-hidden="true" width={40} height={40} style={{ flexShrink: 0, borderRadius: 8, objectFit: "cover", display: "block" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--sans)" }}>{sr.name}</span>
                {isRec && (
                  <span style={{ display: "inline-flex", alignItems: "center", fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--grn)", background: "var(--grnbg)", border: "1px solid var(--grnmid)", borderRadius: 4, padding: "2px 7px", marginLeft: 8, verticalAlign: "middle" }}>
                    {recLabel}
                  </span>
                )}
                <p style={{ fontSize: 12, color: "var(--ink4)", fontFamily: "var(--sans)", lineHeight: 1.45, marginTop: 3 }}>{sr.desc}</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--acc)", flexShrink: 0, fontFamily: "var(--sans)" }}>{ctaLabel} →</span>
            </a>
          );
        };

        const GroupBox = ({ group, style = {} }: { group: typeof groups[number]; style?: CSSProperties }) => (
          <div className="card" style={{ overflow: "hidden", ...style }}>
            <div style={{ padding: "13px 20px", borderBottom: "1px solid var(--bdr)", background: "var(--bgw)" }}>
              <h3 style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink3)", fontFamily: "var(--sans)", margin: 0 }}>{group.label}</h3>
            </div>
            {group.keys.map((k) => <RecRow key={k} k={k} recommended={group.recommended} />)}
          </div>
        );

        return (
          <section id="recs" style={{ padding: PY }}>
            <div style={{ ...MX }}>
              <Ey>{eyebrow}</Ey>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start", marginBottom: 48 }} className="plan-g">
                <div>
                  <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 16 }}>{heading}</h2>
                  <p style={{ fontSize: 14, color: "var(--ink3)", lineHeight: 1.7, fontFamily: "var(--sans)", marginBottom: 0 }}>{sub}</p>
                </div>
                <GroupBox group={leftGroup} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="res-2col">
                {rightGroups.map((g, i) => <GroupBox key={i} group={g} />)}
              </div>
              <p style={{ fontSize: 11.5, color: "var(--ink4)", marginTop: 18, fontFamily: "var(--sans)" }}>{t.results.affilNote}</p>
            </div>
          </section>
        );
      })()}

      {/* ── TRUST ── */}
      <section style={{ padding: PY, background: "var(--ink)" }}>
        <div style={{ ...MX }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 22, height: 1.5, background: "rgba(147,197,253,.5)", borderRadius: 2 }} />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#93C5FD", fontFamily: "var(--sans)" }}>{t.trust.eyebrow}</p>
          </div>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(22px,2.8vw,32px)", fontWeight: 500, color: "#FAFAF9", lineHeight: 1.3, letterSpacing: "-.01em", marginBottom: 40 }}>
            {t.trust.title}
          </h2>
          <div className="trust-g" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
            {t.trust.items.map((it, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "var(--rl)", padding: "24px 20px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--r)", background: "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(250,250,248,.8)", marginBottom: 14 }}>
                  <WizardIcon name={TRUST_ICONS[i] ?? "shield"} size={20} />
                </div>
                <h3 style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 500, color: "#FAFAF8", marginBottom: 8, lineHeight: 1.35 }}>{it.t}</h3>
                <p style={{ fontSize: 12.5, color: "rgba(250,250,248,.5)", lineHeight: 1.65, fontFamily: "var(--sans)" }}>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: PY }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <Ey>{t.faq.eyebrow}</Ey>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: "clamp(24px,3vw,36px)", fontWeight: 500, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 36 }}>
            {t.faq.title}
          </h2>
          <FAQ items={t.faq.items} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SiteFooter locale={lang} currentPath="/" />

      <BackToTop label={t.nav.backToTop} />
      <Analytics />
    </div>
  );
}

export default function PublicHomePage() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg)", minHeight: "100vh" }} />}>
      <HomePageContent />
    </Suspense>
  );
}
