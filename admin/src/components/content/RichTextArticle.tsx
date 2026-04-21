import type { ReactNode } from "react";
import type { ContentLocale } from "@shared/content/types";

const META_COPY = {
  sr: { minRead: "min čitanja" },
  en: { minRead: "min read" },
  ru: { minRead: "мин чтения" },
} as const;

function looksLikeHtml(body: string): boolean {
  return /<(p|h[1-6]|ul|ol|li|blockquote|strong|em|a)\b/i.test(body);
}

type Block =
  | { type: "h1" | "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function parseBlocks(markdown: string, compactNumberedHeadings: boolean): Block[] {
  const blocks: Block[] = [];
  const chunks = markdown.split(/\n\s*\n/g).map((chunk) => chunk.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const firstLine = lines[0] ?? "";
    const restText = lines.slice(1).join(" ").trim();

    if (firstLine.startsWith("# ")) {
      blocks.push({ type: "h1", text: firstLine.replace(/^#\s+/, "").trim() });
      if (restText) blocks.push({ type: "p", text: restText });
      continue;
    }
    if (firstLine.startsWith("## ")) {
      const h2Text = firstLine.replace(/^##\s+/, "").trim();
      if (compactNumberedHeadings && /^\d+[.)]\s+/.test(h2Text)) {
        blocks.push({ type: "p", text: h2Text });
      } else {
        blocks.push({ type: "h2", text: h2Text });
      }
      if (restText) blocks.push({ type: "p", text: restText });
      continue;
    }
    if (chunk.includes("\n- ")) {
      const lines = chunk
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const listItems = lines
        .filter((line) => line.startsWith("- "))
        .map((line) => line.replace(/^-+\s+/, "").trim());
      if (listItems.length > 0) {
        blocks.push({ type: "ul", items: listItems });
        continue;
      }
    }

    blocks.push({ type: "p", text: chunk });
  }

  return blocks;
}

export function RichTextArticle({
  body,
  compactNumberedHeadings = false,
}: {
  body: string;
  compactNumberedHeadings?: boolean;
}) {
  if (looksLikeHtml(body)) {
    return <div className="content-rich-text" dangerouslySetInnerHTML={{ __html: body }} />;
  }

  const blocks = parseBlocks(body, compactNumberedHeadings);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {blocks.map((block, index) => {
        if (block.type === "h1") {
          return (
            <h2
              key={`${block.type}-${index}`}
              style={{
                fontFamily: "var(--heading)",
                fontSize: "clamp(24px,3.2vw,34px)",
                fontWeight: 500,
                lineHeight: 1.22,
                color: "var(--ink)",
                letterSpacing: "-.01em",
                marginTop: index === 0 ? 0 : 8,
              }}
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "h2") {
          return (
            <h3
              key={`${block.type}-${index}`}
              style={{
                fontFamily: "var(--heading)",
                fontSize: 24,
                fontWeight: 500,
                lineHeight: 1.3,
                color: "var(--ink)",
                letterSpacing: "-.01em",
                marginTop: 12,
              }}
            >
              {block.text}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={`${block.type}-${index}`} style={{ paddingLeft: 24, color: "var(--ink2)", lineHeight: 1.78, fontSize: 15 }}>
              {block.items.map((item, itemIndex) => (
                <li key={`${itemIndex}-${item}`} style={{ marginBottom: 8 }}>
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={`${block.type}-${index}`}
            style={{
              fontSize: 15.5,
              color: "var(--ink2)",
              lineHeight: 1.82,
              fontWeight: 400,
            }}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function ContentMetaRow({
  tags,
  dateLabel,
  author,
  readingTime,
  locale = "sr",
}: {
  tags: string[];
  dateLabel: string;
  author: string;
  readingTime: number;
  locale?: ContentLocale;
}) {
  const ui = META_COPY[locale];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((tag) => (
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12.5, color: "var(--ink4)" }}>
        <span>{dateLabel}</span>
        <span>•</span>
        <span>{author}</span>
        <span>•</span>
        <span>{readingTime} {ui.minRead}</span>
      </div>
    </div>
  );
}

export function DetailShell({
  breadcrumb,
  title,
  meta,
  children,
}: {
  breadcrumb: ReactNode;
  title: string;
  meta: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "34px 24px 64px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 16, fontSize: 13, color: "var(--ink4)" }}>{breadcrumb}</div>
        <h1
          style={{
            fontFamily: "var(--heading)",
            fontWeight: 500,
            fontSize: "clamp(32px,4.5vw,50px)",
            lineHeight: 1.12,
            letterSpacing: "-.02em",
            marginBottom: 16,
            color: "var(--ink)",
          }}
        >
          {title}
        </h1>
        {meta}
        <div style={{ marginTop: 20 }}>{children}</div>
      </div>
    </div>
  );
}
