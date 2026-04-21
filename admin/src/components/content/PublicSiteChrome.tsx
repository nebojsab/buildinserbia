"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { ContentLocale } from "@shared/content/types";

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

const LANG_COPY: Record<ContentLocale, { home: string; documents: string; blog: string }> = {
  sr: { home: "Pocetna", documents: "Dokumenti", blog: "Blog" },
  en: { home: "Home", documents: "Documents", blog: "Blog" },
  ru: { home: "Главная", documents: "Документы", blog: "Блог" },
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header
        className="public-chrome-header"
        style={{
          position: "sticky",
          top: 0,
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
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link
              href={withLang("/", locale)}
              style={isNavActive("/", currentPath) ? { ...navLinkStyle, ...navLinkActiveStyle } : navLinkStyle}
              aria-current={isNavActive("/", currentPath) ? "page" : undefined}
            >
              {copy.home}
            </Link>
            <Link
              href={withLang("/documents", locale)}
              style={
                isNavActive("/documents", currentPath)
                  ? { ...navLinkStyle, ...navLinkActiveStyle }
                  : navLinkStyle
              }
              aria-current={isNavActive("/documents", currentPath) ? "page" : undefined}
            >
              {copy.documents}
            </Link>
            <Link
              href={withLang("/blog", locale)}
              style={
                isNavActive("/blog", currentPath)
                  ? { ...navLinkStyle, ...navLinkActiveStyle }
                  : navLinkStyle
              }
              aria-current={isNavActive("/blog", currentPath) ? "page" : undefined}
            >
              {copy.blog}
            </Link>
          </nav>
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
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = "var(--bdr2)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = "var(--bdr)";
              }}
            >
              <span>{FLAGS[locale]}</span>
              <span>{locale.toUpperCase()}</span>
              <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 2 }}>▾</span>
            </button>
            {langOpen ? (
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
            ) : null}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer className="public-chrome-footer" style={{ borderTop: "1px solid var(--bdr)", background: "var(--bgw)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontSize: 12, color: "var(--ink4)" }}>BuildInSerbia content hub</p>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink3)" }}>
            <Link href={withLang("/documents", locale)}>{copy.documents}</Link>
            <Link href={withLang("/blog", locale)}>{copy.blog}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
