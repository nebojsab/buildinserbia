import { useEffect, useMemo, useState } from "react";
import { getCategoryFallback } from "@/lib/categoryFallbackImages";
import type { WizardProjectTree } from "../wizardTree/types";
import type { WizardState } from "./wizardState";
import type { WizardI18n } from "./wizardI18n";
import { subPriceRanges, zoneMultipliers, getQuantity } from "./priceRanges";
import { WizardIcon } from "./WizardIcon";
import { generateWizardDocuments } from "../lib/wizardDocs";
import type { ProjectDocument } from "../lib/wizardDocs";
import { downloadProjectDocumentDocx } from "@shared/lib/exportDocx";
import { buildPlanHtml } from "../lib/buildPlanHtml";
import { LinksSection } from "./LinksSection";

type ProductItem = {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  merchantName: string;
  productUrl: string;
  priceLabel?: string;
  qualityTier?: string;
  isFeatured: boolean;
};
type ProductGroup = {
  categoryId: string;
  categoryTitle: string;
  products: ProductItem[];
};

type Props = {
  lang: string;
  state: WizardState;
  tree: WizardProjectTree;
  i18n: WizardI18n;
  onRestart: () => void;
};

const zoneLabels: Record<string, Record<string, string>> = {
  gradska:    { sr: "Gradska zona",    en: "Urban zone",    ru: "Городская зона" },
  prigradska: { sr: "Prigradska zona", en: "Suburban zone", ru: "Пригородная зона" },
  seoska:     { sr: "Seoska zona",     en: "Rural zone",    ru: "Сельская зона" },
};

function fmtNum(n: number) {
  return new Intl.NumberFormat("sr-Latn-RS").format(Math.round(n));
}
function fmtRange(low: number, high: number) {
  return `${fmtNum(low)} – ${fmtNum(high)} €`;
}
function roundTo(n: number, step: number) {
  return Math.round(n / step) * step;
}
function niceRange(low: number, high: number): [number, number] {
  const step = low >= 5000 ? 500 : low >= 1000 ? 100 : 50;
  return [roundTo(low, step), roundTo(high, step)];
}

type SubRow = {
  subId:    string;
  label:    string;
  low:      number | null;
  high:     number | null;
  qty:      number | null;
  unit:     "m2" | "kom" | "pausal" | "lm";
  details:  string[];
};

type CatGroup = {
  catId:   string;
  icon:    string;
  label:   string;
  rows:    SubRow[];
  catLow:  number;
  catHigh: number;
  hasIncomplete: boolean;
};

const tierLabel: Record<string, Record<string, string>> = {
  lower:  { sr: "Ekonomičan", en: "Budget" },
  mid:    { sr: "Srednji rang", en: "Mid range" },
  higher: { sr: "Viši rang", en: "Higher range" },
};

export function Step5Output({ lang, state, tree, i18n, onRestart }: Props) {
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
  const { location, selectedSubcategories, fieldValues } = state;

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const [docxLoading, setDocxLoading] = useState<string | null>(null);

  const docs: ProjectDocument[] = useMemo(
    () => (state.selectedSubcategories.length > 0 ? generateWizardDocuments(state, tree, lang) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.selectedSubcategories, state.fieldValues, state.projectType, state.location, lang],
  );

  function downloadTxt(doc: ProjectDocument) {
    const bom = "﻿";
    const blob = new Blob([bom + doc.body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadDocx(doc: ProjectDocument) {
    setDocxLoading(doc.id);
    try {
      await downloadProjectDocumentDocx(doc);
    } finally {
      setDocxLoading(null);
    }
  }

  useEffect(() => {
    if (state.selectedCategories.length === 0) return;
    const cats = state.selectedCategories.join(",");
    const apiLang = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
    fetch(`/api/planner-products?cats=${encodeURIComponent(cats)}&lang=${apiLang}`)
      .then((r) => r.json())
      .then((data: { groups: ProductGroup[] }) => setProductGroups(data.groups ?? []))
      .catch(() => {});
  }, [state.selectedCategories, lang]);

  const zm = zoneMultipliers[location?.zoneType ?? "gradska"] ?? 1.0;

  const selectedSubs = tree.categories
    .flatMap((c) => c.subcategories)
    .filter((s) => selectedSubcategories.includes(s.id));

  const totalFields = selectedSubs.reduce((acc, s) => acc + s.fields.length, 0);
  const filledFields = Object.values(fieldValues)
    .flatMap((sv) => Object.values(sv))
    .filter((v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .length;

  // Build cost groups
  const catGroups: CatGroup[] = [];
  let grandLow = 0;
  let grandHigh = 0;
  let grandHasQty = false;
  let grandIncomplete = false;

  for (const cat of tree.categories) {
    const rows: SubRow[] = [];
    let catLow = 0;
    let catHigh = 0;
    let hasIncomplete = false;

    for (const sub of cat.subcategories) {
      if (!selectedSubcategories.includes(sub.id)) continue;
      const pr = subPriceRanges[sub.id];
      if (!pr) continue;

      const vals = (fieldValues[sub.id] ?? {}) as Record<string, unknown>;
      const qty = getQuantity(pr, vals);

      let low: number | null = null;
      let high: number | null = null;

      if (pr.unit === "pausal") {
        [low, high] = niceRange(pr.low * zm, pr.high * zm);
        catLow += low;
        catHigh += high;
        grandHasQty = true;
      } else if (qty !== null) {
        [low, high] = niceRange(pr.low * qty * zm, pr.high * qty * zm);
        catLow += low;
        catHigh += high;
        grandHasQty = true;
      } else {
        hasIncomplete = true;
        grandIncomplete = true;
      }

      // Collect human-readable summaries of selected options/toggles
      const details: string[] = [];
      for (const field of sub.fields) {
        const val = vals[field.key];
        if (val === undefined || val === null || val === "") continue;
        if (field.kind === "select" && field.options) {
          const opt = field.options.find((o) => o.value === val);
          if (opt) details.push(opt.label[l] ?? opt.label["sr"]);
        } else if (field.kind === "chips" && field.options && Array.isArray(val) && val.length > 0) {
          const selected = (val as string[])
            .map((v) => field.options!.find((o) => o.value === v)?.label[l ?? "sr"])
            .filter(Boolean) as string[];
          if (selected.length > 0) details.push(selected.join(", "));
        } else if (field.kind === "toggle" && val === true) {
          details.push(field.label[l] ?? field.label["sr"]);
        } else if ((field.kind === "area" || field.kind === "number" || field.kind === "length") && typeof val === "number" && val > 0) {
          details.push(`${val}${field.unit ? ` ${field.unit}` : ""}`);
        } else if ((field.kind === "area" || field.kind === "number" || field.kind === "length") && val === "unknown") {
          details.push(l === "sr" ? "površina nepoznata" : l === "ru" ? "площадь неизвестна" : "area unknown");
        }
      }

      rows.push({ subId: sub.id, label: sub.label[l], low, high, qty, unit: pr.unit, details });
    }

    if (rows.length > 0) {
      grandLow += catLow;
      grandHigh += catHigh;
      catGroups.push({
        catId: cat.id,
        icon: cat.icon,
        label: cat.label[l],
        rows,
        catLow,
        catHigh,
        hasIncomplete,
      });
    }
  }

  const unitLabel = (unit: "m2" | "kom" | "pausal" | "lm", qty: number | null) => {
    if (unit === "pausal") return l === "sr" ? "fiksno" : "fixed";
    if (unit === "m2") return `${qty} m²`;
    if (unit === "lm") return `${qty} m`;
    if (unit === "kom") return `${qty} ${l === "sr" ? "kom" : "pcs"}`;
    return "";
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {l === "sr" ? "Završeno" : "Complete"}
        </div>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)" }}>
          {i18n.step5Title}
        </h2>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink3)" }}>{i18n.step5Sub}</p>
      </div>

      {/* Summary card */}
      <div className="card" style={{ marginBottom: 24, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <SummaryRow label={i18n.summaryProjectType} value={tree.label[l]} />
        {location && (
          <SummaryRow
            label={i18n.summaryLocation}
            value={`${location.municipality}${location.zoneType ? ` · ${zoneLabels[location.zoneType]?.[l] ?? ""}` : ""}`}
          />
        )}
        <SummaryRow
          label={i18n.summaryWorks}
          value={`${selectedSubs.length} ${l === "sr" ? "vrsta radova" : "works"}`}
        />
        <SummaryRow
          label={l === "sr" ? "Popunjenost" : "Completeness"}
          value={`${filledFields} / ${totalFields} ${l === "sr" ? "polja" : "fields"}`}
        />
      </div>

      {/* Cost estimate */}
      {catGroups.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink3)", marginBottom: 12 }}>
            {l === "sr" ? "Procena troškova radova" : "Labour cost estimate"}
          </div>

          {/* Zone note */}
          {location?.zoneType && location.zoneType !== "gradska" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "var(--r)", fontSize: "0.8125rem", color: "#134279", marginBottom: 12 }}>
              <span style={{ flexShrink: 0, fontSize: 14 }}>ℹ️</span>
              {l === "sr"
                ? `Primenjen korekcioni faktor za ${zoneLabels[location.zoneType]?.sr} (×${zm.toFixed(1)})`
                : l === "ru"
                ? `Применён корректирующий коэффициент для зоны ${zoneLabels[location.zoneType]?.ru} (×${zm.toFixed(1)})`
                : `Zone adjustment applied for ${zoneLabels[location.zoneType]?.en} (×${zm.toFixed(1)})`}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {catGroups.map((grp) => (
              <div key={grp.catId} style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", overflow: "hidden" }}>
                {/* Category header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--bdr)", background: "var(--bgw)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "var(--ink3)" }}>
                    <span style={{ color: "var(--acc)", display: "flex" }}>
                      <WizardIcon name={grp.icon} size={13} />
                    </span>
                    {grp.label}
                  </div>
                  {grp.catLow > 0 && (
                    <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--ink)" }}>
                      {fmtRange(grp.catLow, grp.catHigh)}
                    </span>
                  )}
                </div>

                {/* Sub rows */}
                <div style={{ padding: "4px 0" }}>
                  {grp.rows.map((row, i) => (
                    <div
                      key={row.subId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        gap: "4px 12px",
                        alignItems: "baseline",
                        padding: "8px 14px",
                        borderBottom: i < grp.rows.length - 1 ? "1px solid var(--bdr)" : "none",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.8125rem", color: "var(--ink2)" }}>{row.label}</span>
                        {row.details.length > 0 && (
                          <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "var(--ink4)", lineHeight: 1.4 }}>
                            {row.details.join(" · ")}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink4)", whiteSpace: "nowrap" as const }}>
                        {row.low !== null ? unitLabel(row.unit, row.qty) : "—"}
                      </span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: row.low !== null ? "var(--ink)" : "var(--ink4)", whiteSpace: "nowrap" as const, textAlign: "right" as const }}>
                        {row.low !== null
                          ? fmtRange(row.low, row.high!)
                          : row.unit === "kom"
                            ? (l === "sr" ? "unesi broj" : l === "ru" ? "введите количество" : "enter count")
                            : row.unit === "lm"
                              ? (l === "sr" ? "unesi dužinu" : l === "ru" ? "введите длину" : "enter length")
                              : (l === "sr" ? "unesi površinu" : l === "ru" ? "введите площадь" : "enter area")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Grand total */}
          {grandHasQty && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "14px 18px", background: "var(--accbg)", border: "2px solid var(--acc)", borderRadius: "var(--r)" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--acc)" }}>
                  {l === "sr" ? "Ukupno (radovi)" : "Total (labour)"}
                </div>
                {grandIncomplete && (
                  <div style={{ fontSize: "0.75rem", color: "var(--ink4)", marginTop: 2 }}>
                    {l === "sr" ? "* neke stavke bez unesenih podataka" : l === "ru" ? "* некоторые позиции без данных" : "* some items missing input"}
                  </div>
                )}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--acc)", textAlign: "right" as const }}>
                {fmtRange(grandLow, grandHigh)}
                {grandIncomplete && <span style={{ fontSize: "0.75rem" }}>+</span>}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bgw)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", fontSize: "0.75rem", color: "var(--ink4)", lineHeight: 1.5 }}>
            {l === "sr"
              ? "Procena se odnosi na troškove radne snage. Nisu uključeni: materijal, sanitarije, armature, keramika, stolarija ni naknada za projektovanje. Stvarna cena zavisi od specifičnosti projekta i izabranog izvođača."
              : "Estimate covers labour costs only. Not included: materials, fixtures, tiles, joinery, or design fees. Actual cost depends on project specifics and chosen contractor."}
          </div>
        </div>
      )}

      {/* Works summary chips */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink3)", marginBottom: 10 }}>
          {i18n.summaryWorks}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
          {selectedSubs.map((sub) => (
            <span
              key={sub.id}
              style={{ padding: "4px 12px", borderRadius: 100, background: "var(--bgw)", border: "1px solid var(--bdr)", fontSize: "0.8125rem", color: "var(--ink2)" }}
            >
              {sub.label[l]}
            </span>
          ))}
        </div>
      </div>

      {/* CTA — directly after cost estimate */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" as const, marginBottom: 28 }}>
        <button
          className="btn-g"
          style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 700 }}
          onClick={() => {
            const html = buildPlanHtml(state, tree, lang);
            const w = window.open("", "_blank");
            if (w) { w.document.write(html); w.document.close(); }
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {l === "sr" ? "Skini plan (PDF)" : "Download plan (PDF)"}
        </button>
        <button
          onClick={onRestart}
          style={{ padding: "9px 22px", borderRadius: "var(--r)", border: "1.5px solid var(--bdr2)", background: "var(--card)", color: "var(--ink2)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
        >
          {i18n.restart}
        </button>
      </div>

      {/* Generated documents */}
      {docs.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink3)", marginBottom: 12 }}>
            {l === "sr" ? "Spremni dokumenti za vaš projekat" : "Ready documents for your project"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {docs.map((doc) => (
              <div key={doc.id} style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", overflow: "hidden" }}>
                <div style={{ padding: "14px 16px 12px" }}>
                  {/* Badges */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: "var(--accbg)", color: "var(--acc)", border: "1px solid var(--accmid)" }}>
                      {l === "sr" ? "Auto-popunjeno" : "Auto-filled"}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: "var(--bgw)", color: "var(--ink4)", border: "1px solid var(--bdr)" }}>
                      {l === "sr" ? "Prilagođeno vašem projektu" : "Tailored to your project"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4, lineHeight: 1.3 }}>{doc.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--ink3)", lineHeight: 1.45, marginBottom: 12 }}>{doc.description}</div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    <button
                      onClick={() => setPreviewDocId(previewDocId === doc.id ? null : doc.id)}
                      style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "var(--r)", border: "1.5px solid var(--bdr2)", background: "var(--bgw)", color: "var(--ink2)", cursor: "pointer", fontWeight: 500 }}
                    >
                      {previewDocId === doc.id ? (l === "sr" ? "Zatvori" : "Close") : (l === "sr" ? "Pregled" : "Preview")}
                    </button>
                    <button
                      onClick={() => downloadTxt(doc)}
                      style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "var(--r)", border: "none", background: "var(--acc)", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                    >
                      Preuzmi (.txt)
                    </button>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button
                      onClick={() => downloadDocx(doc)}
                      disabled={docxLoading === doc.id}
                      style={{ fontSize: "0.8rem", padding: "5px 12px", borderRadius: "var(--r)", border: "1.5px solid var(--bdr2)", background: "var(--bgw)", color: docxLoading === doc.id ? "var(--ink4)" : "var(--ink2)", cursor: docxLoading === doc.id ? "wait" : "pointer", fontWeight: 500 }}
                    >
                      {docxLoading === doc.id ? (l === "sr" ? "Generišem..." : "Generating...") : "Word (.docx)"}
                    </button>
                  </div>
                </div>

                {/* Preview pane */}
                {previewDocId === doc.id && (
                  <div style={{ borderTop: "1px solid var(--bdr)", background: "var(--bgw)", padding: "14px 16px", maxHeight: 300, overflowY: "auto" as const }}>
                    <pre style={{ margin: 0, fontSize: "0.72rem", color: "var(--ink3)", lineHeight: 1.55, whiteSpace: "pre-wrap" as const, fontFamily: "var(--mono, monospace)" }}>
                      {doc.body}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p style={{ marginTop: 10, fontSize: "0.75rem", color: "var(--ink4)" }}>
            {l === "sr"
              ? "Dokumenti su generisani automatski i treba ih prilagoditi vašem projektu. Predmer u Word formatu sadrži tabelu stavki; ostali dokumenti su strukturirani paragrafi."
              : "Documents are auto-generated and should be adapted to your specific project. The BOQ in Word format contains a table; other documents use structured paragraphs."}
          </p>
        </div>
      )}

      {/* Useful links */}
      <LinksSection
        lang={lang}
        municipality={state.location?.municipality}
        selectedCategories={state.selectedCategories}
      />

      {/* Product recommendations */}
      {productGroups.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink3)", marginBottom: 12 }}>
            {l === "sr" ? "Možda će vam trebati i ovo" : "You may also need"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {productGroups.map((grp) => (
              <div key={grp.categoryId}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--ink4)", marginBottom: 8 }}>
                  {grp.categoryTitle.toUpperCase()}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {grp.products.map((p) => (
                    <a
                      key={p.id}
                      href={p.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", overflow: "hidden", transition: "border-color .15s, box-shadow .15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--acc)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--bdr)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                      >
                        <div style={{ height: 140, overflow: "hidden", background: "var(--bgw)" }}>
                          <img
                            src={p.imageUrl || getCategoryFallback(grp.categoryId)}
                            alt={p.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.onerror = null;
                              img.onload = null;
                              img.src = getCategoryFallback(grp.categoryId);
                            }}
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              if (img.naturalWidth === 0) {
                                img.onerror = null;
                                img.onload = null;
                                img.src = getCategoryFallback(grp.categoryId);
                              }
                            }}
                          />
                        </div>
                        <div style={{ padding: "12px 14px 14px" }}>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.35, marginBottom: 4 }}>{p.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--ink3)", lineHeight: 1.4, marginBottom: 8 }}>{p.shortDescription}</div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                            {p.priceLabel && (
                              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--acc)" }}>{p.priceLabel}</span>
                            )}
                            {p.qualityTier && (
                              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--bdr2)", color: "var(--ink3)" }}>
                                {tierLabel[p.qualityTier]?.[l] ?? p.qualityTier}
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--ink4)" }}>
                            {l === "sr" ? "Prodavac" : "Vendor"}: {p.merchantName}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: "0.8125rem", color: "var(--ink3)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)", textAlign: "right" as const }}>
        {value}
      </span>
    </div>
  );
}
