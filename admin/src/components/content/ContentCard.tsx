"use client";

import Link from "next/link";
import { formatContentDate } from "@shared/content/helpers";
import type { BaseContentItem, ContentLocale } from "@shared/content/types";

const UI_COPY = {
  sr: {
    fallbackCover: "Resurs",
    minRead: "min čitanja",
  },
  en: {
    fallbackCover: "Resource",
    minRead: "min read",
  },
  ru: {
    fallbackCover: "Ресурс",
    minRead: "мин чтения",
  },
} as const;

export function ContentCard({
  item,
  href,
  ctaLabel,
  locale = "sr",
}: {
  item: BaseContentItem;
  href: string;
  ctaLabel: string;
  locale?: ContentLocale;
}) {
  const ui = UI_COPY[locale];
  const effectiveCoverImage = item.coverImage;

  return (
    <article className="card card-h" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      <Link
        href={href}
        aria-label={`Open ${item.title}`}
        style={{
          aspectRatio: "16 / 9",
          background: !effectiveCoverImage
            ? "linear-gradient(145deg, rgba(196,92,46,.13) 0%, rgba(29,78,216,.08) 100%)"
            : undefined,
          borderBottom: "1px solid var(--bdr)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink3)",
          fontSize: 12,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {effectiveCoverImage ? (
          <img
            src={effectiveCoverImage}
            alt={item.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}
        {!effectiveCoverImage ? ui.fallbackCover : ""}
      </Link>

      <div style={{ padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.categories.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "4px 9px",
                borderRadius: 999,
                border: "1px solid var(--bdr)",
                background: "var(--bgw)",
                color: "var(--ink3)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 style={{ fontFamily: "var(--heading)", fontSize: 20, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>
          <Link href={href}>{item.title}</Link>
        </h3>

        <p
          style={{
            fontSize: 13.5,
            color: "var(--ink3)",
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "4.8em",
          }}
        >
          {item.excerpt}
        </p>

        <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, color: "var(--ink4)" }}>
          <span>{formatContentDate(item.createdAt)}</span>
          <span>•</span>
          <span>{item.author}</span>
          <span>•</span>
          <span>{item.readingTime ?? 1} {ui.minRead}</span>
        </div>

        <Link href={href} className="btn-g" style={{ width: "fit-content", marginTop: 2 }}>
          {ctaLabel} →
        </Link>
      </div>
    </article>
  );
}
