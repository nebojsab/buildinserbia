"use client";

import { SiteLogo } from "@shared/components/SiteLogo";
import { FooterLocalTime } from "@shared/components/FooterLocalTime";
import { HR } from "@shared/components/ui";
import { translations } from "@shared/translations";
import type { ContentLocale } from "@shared/content/types";

const MX = { maxWidth: 1100, margin: "0 auto" };

function withLang(path: string, locale: ContentLocale) {
  return `${path}?lang=${locale}`;
}

const NAV_SECTIONS = [
  { id: "how",     hash: "#how"     },
  { id: "planner", hash: "#planner" },
  { id: "faq",     hash: "#faq"     },
] as const;

export function SiteFooter({
  locale,
  currentPath,
}: {
  locale: ContentLocale;
  currentPath: string;
}) {
  const t = translations[locale];
  const lang = locale;

  const navLabel  = lang === "sr" ? "Navigacija"  : lang === "en" ? "Navigation"  : "Навигация";
  const ctaLabel  = lang === "sr" ? "Kontakt"      : lang === "en" ? "Contact"     : "Контакт";
  const langLabel = lang === "sr" ? "Jezik"        : lang === "en" ? "Language"    : "Язык";
  const docsLabel = lang === "sr" ? "Dokumenti"    : lang === "en" ? "Documents"   : "Документы";
  const blogLabel = lang === "sr" ? "Blog"         : lang === "en" ? "Blog"        : "Блог";

  return (
    <footer style={{ background: "var(--bgw)", borderTop: "1px solid var(--bdr)", padding: "52px 24px 32px" }}>
      <div style={{ ...MX }}>
        <div className="how-g footer-g" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 44, marginBottom: 44 }}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <SiteLogo compact loading="lazy" />
            </div>
            <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.7, maxWidth: 270, marginBottom: 12, fontFamily: "var(--sans)" }}>
              {t.footer.tagline}
            </p>
            <p style={{ fontSize: 11, color: "var(--ink4)", lineHeight: 1.6, maxWidth: 290, fontFamily: "var(--sans)" }}>
              {t.footer.disclaimer}
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink3)", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--sans)" }}>
              {navLabel}
            </p>
            {NAV_SECTIONS.map((s, i) => (
              <a
                key={s.id}
                href={withLang("/", locale) + s.hash}
                style={{ display: "block", fontSize: 13.5, color: "var(--ink3)", marginBottom: 10, fontFamily: "var(--sans)", textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink3)")}
              >
                {t.nav.links[i]}
              </a>
            ))}
            <a href={withLang("/documents", locale)} style={{ display: "block", fontSize: 13.5, marginBottom: 10, fontFamily: "var(--sans)", textDecoration: "none", fontWeight: currentPath === "/documents" ? 700 : 400, color: currentPath === "/documents" ? "var(--acc)" : "var(--ink3)" }}>
              {docsLabel}
            </a>
            <a href={withLang("/blog", locale)} style={{ display: "block", fontSize: 13.5, fontFamily: "var(--sans)", textDecoration: "none", fontWeight: currentPath === "/blog" ? 700 : 400, color: currentPath === "/blog" ? "var(--acc)" : "var(--ink3)" }}>
              {blogLabel}
            </a>
          </div>

          {/* Contact + language column */}
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink3)", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--sans)" }}>
              {ctaLabel}
            </p>
            <a
              href={`mailto:${t.footer.contact}`}
              style={{ fontSize: 13.5, color: "var(--ink3)", fontFamily: "var(--sans)", transition: "color .15s", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--acc)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink3)")}
            >
              {t.footer.contact}
            </a>
            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink3)", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--sans)" }}>
                {langLabel}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {(["sr", "en", "ru"] as const).map((l) => (
                  <a
                    key={l}
                    href={withLang(currentPath, l)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 6,
                      border: `1.5px solid ${l === locale ? "var(--acc)" : "var(--bdr)"}`,
                      letterSpacing: ".06em", textTransform: "uppercase" as const,
                      fontFamily: "var(--sans)", textDecoration: "none", transition: "all .15s",
                      background: l === locale ? "var(--accbg)" : "transparent",
                      color: l === locale ? "var(--acc)" : "var(--ink4)",
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <HR />

        <div style={{ paddingTop: 18, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--ink4)", fontFamily: "var(--sans)" }}>{t.footer.copy}</p>
            <FooterLocalTime lang={lang} label={t.footer.localTimePrefix} />
          </div>
          <p style={{ fontSize: 11.5, color: "var(--ink4)", fontFamily: "var(--sans)", maxWidth: 460, textAlign: "right" }}>
            {t.footer.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
