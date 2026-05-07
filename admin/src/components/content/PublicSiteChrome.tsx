"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { openContactDrawer } from "@/components/contact/SiteBanner";
import type { CSSProperties, ReactNode } from "react";
import type { ContentLocale } from "@shared/content/types";
import { SiteFooter } from "@/components/layout/SiteFooter";

const navLinkStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ink3)",
  fontFamily: "var(--sans)",
  paddingBottom: 2,
  borderBottom: "2px solid transparent",
  transition: "color .15s, border-color .15s",
};

const navLinkActiveStyle: CSSProperties = {
  color: "var(--acc)",
  fontWeight: 700,
  borderBottomColor: "var(--acc)",
};

const LANG_COPY: Record<ContentLocale, { home: string; documents: string; blog: string; contact: string }> = {
  sr: { home: "Pocetna", documents: "Dokumenti", blog: "Blog", contact: "Kontakt" },
  en: { home: "Home", documents: "Documents", blog: "Blog", contact: "Contact" },
  ru: { home: "Главная", documents: "Документы", blog: "Блог", contact: "Контакт" },
};

const LANG_OPTIONS: Array<{ id: ContentLocale; label: string }> = [
  { id: "sr", label: "Srpski" },
  { id: "en", label: "English" },
  { id: "ru", label: "Русский" },
];

const FLAGS: Record<ContentLocale, string> = {
  sr: "🇷🇸",
  en: "🇬🇧",
  ru: "🇷🇺",
};

function withLang(path: string, locale: ContentLocale): string {
  return `${path}?lang=${locale}`;
}

function isNavActive(targetPath: string, currentPath: string): boolean {
  if (targetPath === "/") return currentPath === "/";
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function PublicSiteChrome({
  children,
  locale,
  currentPath,
}: {
  children: ReactNode;
  locale: ContentLocale;
  currentPath: string;
}) {
  const copy = LANG_COPY[locale];
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: withLang("/", locale), label: copy.home, path: "/" },
    { href: withLang("/documents", locale), label: copy.documents, path: "/documents" },
    { href: withLang("/blog", locale), label: copy.blog, path: "/blog" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header
        className="public-chrome-header"
        style={{
          position: "sticky",
          top: "var(--banner-h, 0px)" as string,
          zIndex: 100,
          background: "rgba(250,250,249,.94)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--bdr)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 62,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <img src="/Logo.svg" alt="BuildInSerbia" style={{ height: 24, width: "auto", display: "block" }} />
          </Link>

          {/* Desktop nav */}
          <nav className="pc-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.href}
                style={isNavActive(link.path, currentPath) ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
                aria-current={isNavActive(link.path, currentPath) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <button onClick={openContactDrawer} style={{ ...navLinkStyle, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {copy.contact}
            </button>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Lang switcher */}
            <div ref={langRef} className="lang-wrap">
              <button
                type="button"
                onClick={() => setLangOpen((prev) => !prev)}
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
              >
                <span>{FLAGS[locale]}</span>
                <span>{locale.toUpperCase()}</span>
                <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 2 }}>▾</span>
              </button>
              {langOpen && (
                <div className="lang-menu">
                  {LANG_OPTIONS.map((option) => (
                    <Link
                      key={option.id}
                      href={withLang(currentPath, option.id)}
                      className={`lang-btn${option.id === locale ? " active" : ""}`}
                      onClick={() => setLangOpen(false)}
                    >
                      <span style={{ fontSize: 15 }}>{FLAGS[option.id]}</span>
                      <span>{option.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger button — mobile only */}
            <button
              type="button"
              className="pc-hamburger"
              aria-label={mobileMenuOpen ? "Zatvori meni" : "Otvori meni"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              style={{
                display: "none",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                width: 40,
                height: 40,
                border: "1.5px solid var(--bdr)",
                borderRadius: "var(--r)",
                background: "var(--card)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{ display: "block", width: 18, height: 1.5, background: "var(--ink2)", borderRadius: 2, transition: "transform .2s, opacity .2s", transform: mobileMenuOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 18, height: 1.5, background: "var(--ink2)", borderRadius: 2, transition: "opacity .2s", opacity: mobileMenuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 18, height: 1.5, background: "var(--ink2)", borderRadius: 2, transition: "transform .2s, opacity .2s", transform: mobileMenuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="pc-mobile-menu"
            style={{
              borderTop: "1px solid var(--bdr)",
              background: "rgba(250,250,249,.98)",
              padding: "8px 0 16px",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "13px 24px",
                  fontSize: 15,
                  fontWeight: isNavActive(link.path, currentPath) ? 700 : 500,
                  color: isNavActive(link.path, currentPath) ? "var(--acc)" : "var(--ink2)",
                  fontFamily: "var(--sans)",
                  borderLeft: isNavActive(link.path, currentPath) ? "3px solid var(--acc)" : "3px solid transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { openContactDrawer(); setMobileMenuOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 24px", fontSize: 15, fontWeight: 500, color: "var(--ink2)", fontFamily: "var(--sans)", background: "none", border: "none", borderLeft: "3px solid transparent", cursor: "pointer" }}
            >
              {copy.contact}
            </button>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <SiteFooter locale={locale} currentPath={currentPath} />
    </div>
  );
}
