import { type ReactNode } from "react";
import type { Lang } from "../translations";

function linkAnchorCaption(href: string, lang: Lang): string {
  if (href.startsWith("/")) {
    if (href.includes("checklists")) {
      return lang === "sr"
        ? "Dokumenti (check liste)"
        : lang === "ru"
          ? "Документы (чек-листы)"
          : "Documents (checklists)";
    }
    if (href.startsWith("/documents")) {
      return lang === "sr" ? "Dokumenti" : lang === "ru" ? "Документы" : "Documents";
    }
    if (href.startsWith("/blog")) {
      return lang === "sr" ? "Blog" : lang === "ru" ? "Блог" : "Blog";
    }
    return href;
  }
  try {
    const u = new URL(href);
    const h = u.hostname.replace(/^www\./, "");
    if (h.includes("duckduckgo")) {
      return lang === "sr" ? "Pretraga lokalne uprave" : lang === "ru" ? "Поиск" : "Local admin search";
    }
    if (h.includes("euprava")) {
      return "eUprava";
    }
    if (h.includes("katastar") || h.includes("rga.gov")) {
      return lang === "sr" ? "Katastar (RGA)" : lang === "ru" ? "Кадастр (RGA)" : "Cadastre (RGA)";
    }
    return h;
  } catch {
    return href.length > 42 ? `${href.slice(0, 40)}…` : href;
  }
}

function linkifyUrlRuns(line: string, lang: Lang): ReactNode {
  const re = /(https?:\/\/[^\s<]+)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(line.slice(last, m.index));
    }
    const href = m[1];
    nodes.push(
      <a
        key={k}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="artifact-inline-link"
        style={{
          color: "var(--acc)",
          textDecoration: "underline",
          textUnderlineOffset: 2,
          wordBreak: "break-all",
        }}
      >
        {linkAnchorCaption(href, lang)}
      </a>,
    );
    k += 1;
    last = m.index + m[0].length;
  }
  if (last < line.length) {
    nodes.push(line.slice(last));
  }
  return nodes.length > 0 ? <>{nodes}</> : line;
}

function OneLine({ line, lang, isFirst }: { line: string; lang: Lang; isFirst: boolean }) {
  const m = /^(.*):\s+(\/[^\s]+|https?:\/\/\S+)\s*$/.exec(line);
  if (m) {
    const label = m[1].trim();
    const href = m[2];
    const external = href.startsWith("http");
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "4px 8px",
          marginTop: isFirst ? 0 : 8,
        }}
      >
        <span style={{ color: "var(--ink2)", fontWeight: 500 }}>{label}:</span>
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="artifact-inline-link"
          style={{
            color: "var(--acc)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            wordBreak: "break-all",
            maxWidth: "100%",
          }}
        >
          {linkAnchorCaption(href, lang)}
        </a>
      </div>
    );
  }

  return (
    <p
      style={{
        margin: isFirst ? 0 : "8px 0 0",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        minWidth: 0,
      }}
    >
      {linkifyUrlRuns(line, lang)}
    </p>
  );
}

type Props = {
  content: string;
  lang: Lang;
};

/**
 * Renders planer artifact text: “Label: url” → clickable link; long lines wrap; bare https URLs in prose get linkified.
 */
export function ArtifactContentRich({ content, lang }: Props) {
  const lines = content.split("\n");
  const firstTextLine = lines.findIndex((l) => l.length > 0);
  return (
    <div
      className="artifact-content-rich"
      style={{
        margin: "6px 0 0",
        fontSize: 12.5,
        color: "var(--ink3)",
        lineHeight: 1.65,
        minWidth: 0,
        width: "100%",
      }}
    >
      {lines.map((line, i) =>
        line.length === 0 ? (
          <div key={i} style={{ height: 4 }} aria-hidden />
        ) : (
          <OneLine key={i} line={line} lang={lang} isFirst={i === firstTextLine} />
        ),
      )}
    </div>
  );
}
