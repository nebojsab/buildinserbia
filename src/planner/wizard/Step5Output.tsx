import type { WizardProjectTree } from "../wizardTree/types";
import type { WizardState } from "./wizardState";
import type { WizardI18n } from "./wizardI18n";

type Props = {
  lang: string;
  state: WizardState;
  tree: WizardProjectTree;
  i18n: WizardI18n;
  onRestart: () => void;
};

const zoneLabels: Record<string, Record<string, string>> = {
  gradska: { sr: "Gradska zona", en: "Urban zone" },
  prigradska: { sr: "Prigradska zona", en: "Suburban zone" },
  seoska: { sr: "Seoska zona", en: "Rural zone" },
};

export function Step5Output({ lang, state, tree, i18n, onRestart }: Props) {
  const l = lang === "en" ? "en" : "sr";
  const { projectType, location, selectedSubcategories, fieldValues } = state;

  const selectedSubs = tree.categories
    .flatMap((c) => c.subcategories)
    .filter((s) => selectedSubcategories.includes(s.id));

  const totalFields = selectedSubs.reduce((acc, s) => acc + s.fields.length, 0);
  const filledFields = Object.values(fieldValues)
    .flatMap((sv) => Object.values(sv))
    .filter((v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .length;

  return (
    <div>
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
      <div className="card" style={{ marginBottom: 20, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <SummaryRow
          label={i18n.summaryProjectType}
          value={tree.label[l]}
        />
        {location && (
          <SummaryRow
            label={i18n.summaryLocation}
            value={`${location.municipality}${location.zoneType ? ` · ${zoneLabels[location.zoneType]?.[l] ?? ""}` : ""}`}
          />
        )}
        <SummaryRow
          label={i18n.summaryWorks}
          value={`${selectedSubs.length} ${l === "sr" ? "vrsta radova" : "works selected"}`}
        />
        <SummaryRow
          label={l === "sr" ? "Popunjenost" : "Completeness"}
          value={`${filledFields} / ${totalFields} ${l === "sr" ? "polja" : "fields"}`}
        />
      </div>

      {/* Works list */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink3)", marginBottom: 10 }}>
          {i18n.summaryWorks}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {selectedSubs.map((sub) => (
            <span
              key={sub.id}
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: "var(--bgw)",
                border: "1px solid var(--bdr)",
                fontSize: "0.8125rem",
                color: "var(--ink2)",
              }}
            >
              {sub.label[l]}
            </span>
          ))}
        </div>
      </div>

      {/* Coming soon placeholder */}
      <div
        style={{
          background: "var(--bgw)",
          border: "1.5px dashed var(--bdr2)",
          borderRadius: "var(--rl)",
          padding: "28px 24px",
          textAlign: "center" as const,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: 10 }}>🏗</div>
        <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6, fontFamily: "var(--heading)" }}>
          {l === "sr" ? "Procena troškova" : "Cost estimate"}
        </div>
        <p style={{ margin: "0 0 4px", fontSize: "0.875rem", color: "var(--ink3)" }}>
          {i18n.comingSoon}
        </p>
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--ink4)" }}>
          {l === "sr"
            ? "Na osnovu vaše lokacije, kategorija i mera generišemo listu izvođača i procenu."
            : "Based on your location, categories and dimensions we generate a contractor list and estimate."}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="btn-g" onClick={onRestart}>
          {i18n.restart}
        </button>
      </div>
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
