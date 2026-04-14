import { useEffect, useMemo, useState } from "react";
import { fetchDocuments, type DocEntry } from "../api/documents";

type Lang = "sr" | "en" | "ru";

const LABELS: Record<Lang, {
  eyebrow: string;
  title: string;
  sub: string;
  search: string;
  all: string;
  sortNewest: string;
  sortOldest: string;
  download: string;
  empty: string;
  emptySearch: string;
  loading: string;
  sizeUnit: (bytes: number) => string;
  dateFormat: (iso: string) => string;
}> = {
  sr: {
    eyebrow: "Biblioteka dokumenata",
    title: "Preuzmite relevantne dokumente",
    sub: "Ovde možete pronaći i preuzeti sve dokumente potrebne za gradnju i renoviranje u Srbiji — propisi, obrasci, uputstva i više.",
    search: "Pretraži dokumente...",
    all: "Sve kategorije",
    sortNewest: "Najnoviji",
    sortOldest: "Najstariji",
    download: "Preuzmi",
    empty: "Nema dostupnih dokumenata.",
    emptySearch: "Nema rezultata za vašu pretragu.",
    loading: "Učitavanje...",
    sizeUnit: formatFileSize,
    dateFormat: (iso) =>
      new Date(iso).toLocaleDateString("sr-RS", { day: "numeric", month: "short", year: "numeric" }),
  },
  en: {
    eyebrow: "Document Library",
    title: "Download relevant documents",
    sub: "Find and download all documents you need for building and renovating in Serbia — regulations, forms, guides and more.",
    search: "Search documents...",
    all: "All categories",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    download: "Download",
    empty: "No documents available.",
    emptySearch: "No results match your search.",
    loading: "Loading...",
    sizeUnit: formatFileSize,
    dateFormat: (iso) =>
      new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  },
  ru: {
    eyebrow: "Библиотека документов",
    title: "Скачайте нужные документы",
    sub: "Здесь вы найдёте все документы, необходимые для строительства и ремонта в Сербии — нормативы, бланки, инструкции и многое другое.",
    search: "Поиск документов...",
    all: "Все категории",
    sortNewest: "Сначала новые",
    sortOldest: "Сначала старые",
    download: "Скачать",
    empty: "Нет доступных документов.",
    emptySearch: "По вашему запросу ничего не найдено.",
    loading: "Загрузка...",
    sizeUnit: formatFileSize,
    dateFormat: (iso) =>
      new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }),
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(fileType: string): string {
  const t = fileType.toLowerCase();
  if (t.includes("pdf")) return "📄";
  if (t.includes("word") || t.includes("doc")) return "📝";
  if (t.includes("sheet") || t.includes("xls") || t.includes("csv")) return "📊";
  if (t.includes("zip") || t.includes("rar")) return "🗜️";
  if (t.includes("image") || t.includes("png") || t.includes("jpg")) return "🖼️";
  return "📎";
}

function fileExtBadge(fileName: string, fileType: string): string {
  const ext = fileName.split(".").pop()?.toUpperCase() || fileType.split("/").pop()?.toUpperCase() || "FILE";
  return ext.slice(0, 5);
}

export function DocumentLibrary({ lang }: { lang: Lang }) {
  const l = LABELS[lang];
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDocuments().then((data) => {
      if (!cancelled) {
        setDocs(data.documents);
        setCategories(data.categories);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = [...docs];
    if (activeCategory !== "__all__") {
      result = result.filter((d) => d.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description ?? "").toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const diff = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
    return result;
  }, [docs, activeCategory, search, sortOrder]);

  const isEmpty = !loading && docs.length === 0;
  const noResults = !loading && docs.length > 0 && filtered.length === 0;

  return (
    <>
      {/* Controls row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 28,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 0 }}>
          <span
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: "var(--ink4)",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={l.search}
            className="finput"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
          className="fselect"
          style={{ width: "auto", flex: "0 0 auto" }}
        >
          <option value="newest">{l.sortNewest}</option>
          <option value="oldest">{l.sortOldest}</option>
        </select>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          <button
            type="button"
            className={`lchip${activeCategory === "__all__" ? " act" : ""}`}
            onClick={() => setActiveCategory("__all__")}
          >
            {l.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`lchip${activeCategory === cat ? " act" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink4)", fontSize: 14, fontFamily: "var(--sans)" }}>
          {l.loading}
        </div>
      )}

      {isEmpty && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            color: "var(--ink4)",
            fontSize: 14,
            fontFamily: "var(--sans)",
          }}
        >
          {l.empty}
        </div>
      )}

      {noResults && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "var(--ink4)",
            fontSize: 14,
            fontFamily: "var(--sans)",
          }}
        >
          {l.emptySearch}
        </div>
      )}

      {/* Document grid */}
      {!loading && filtered.length > 0 && (
        <div
          className="docs-g"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} downloadLabel={l.download} dateFormat={l.dateFormat} sizeUnit={l.sizeUnit} />
          ))}
        </div>
      )}
    </>
  );
}

function DocCard({
  doc,
  downloadLabel,
  dateFormat,
  sizeUnit,
}: {
  doc: DocEntry;
  downloadLabel: string;
  dateFormat: (iso: string) => string;
  sizeUnit: (bytes: number) => string;
}) {
  return (
    <div
      className="card card-h"
      style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 0 }}
    >
      {/* Icon + ext badge row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "var(--accbg)",
            border: "1px solid var(--accmid)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {fileIcon(doc.fileType)}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: ".08em",
            padding: "3px 8px",
            borderRadius: 6,
            background: "var(--bgw)",
            border: "1px solid var(--bdr)",
            color: "var(--ink3)",
            fontFamily: "var(--sans)",
            textTransform: "uppercase",
          }}
        >
          {fileExtBadge(doc.fileName, doc.fileType)}
        </span>
      </div>

      {/* Category */}
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: "var(--acc)",
          fontFamily: "var(--sans)",
          marginBottom: 6,
        }}
      >
        {doc.category}
      </p>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--heading)",
          fontSize: 15,
          fontWeight: 500,
          color: "var(--ink)",
          lineHeight: 1.35,
          marginBottom: 8,
          flex: 1,
        }}
      >
        {doc.title}
      </h3>

      {/* Description */}
      {doc.description && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink3)",
            lineHeight: 1.6,
            fontFamily: "var(--sans)",
            marginBottom: 14,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {doc.description}
        </p>
      )}

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: "auto",
          paddingTop: doc.description ? 0 : 14,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--ink4)", fontFamily: "var(--sans)" }}>
          {dateFormat(doc.uploadedAt)}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--bdr2)", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "var(--ink4)", fontFamily: "var(--sans)" }}>
          {sizeUnit(doc.fileSize)}
        </span>
      </div>

      {/* Download button */}
      <a
        href={doc.fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="btn-p"
        style={{ fontSize: 13, padding: "10px 18px", textDecoration: "none", justifyContent: "center" }}
      >
        ↓ {downloadLabel}
      </a>
    </div>
  );
}
