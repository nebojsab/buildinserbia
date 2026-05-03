import type { WizardProjectTree } from "../wizardTree/types";
import type { WizardI18n } from "./wizardI18n";
import { WizardIcon } from "./WizardIcon";

type Props = {
  lang: string;
  tree: WizardProjectTree;
  selected: string[];
  onChange: (ids: string[]) => void;
  i18n: WizardI18n;
};

function toggle(arr: string[], id: string) {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

export function Step2Categories({ lang, tree, selected, onChange, i18n }: Props) {
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
  const allIds = tree.categories.map((c) => c.id);
  const allSelected = allIds.every((id) => selected.includes(id));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)" }}>
          {i18n.step2Title}
        </h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink3)" }}>{i18n.step2Sub}</p>
          <button
            className="btn-g"
            style={{ fontSize: "0.8125rem", padding: "5px 12px" }}
            onClick={() => onChange(allSelected ? [] : allIds)}
          >
            {allSelected ? i18n.deselectAll : i18n.selectAll}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        {tree.categories.map((cat) => {
          const isSelected = selected.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onChange(toggle(selected, cat.id))}
              style={{
                border: isSelected ? "2px solid var(--acc)" : "2px solid var(--bdr)",
                borderRadius: "var(--rl)",
                padding: "14px 14px",
                cursor: "pointer",
                background: isSelected ? "var(--accbg)" : "var(--card)",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--r)",
                  background: isSelected ? "var(--acc)" : "var(--accbg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isSelected ? "#fff" : "var(--acc)",
                  flexShrink: 0,
                }}
              >
                <WizardIcon name={cat.icon} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {cat.label[l]}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--ink4)", marginTop: 2 }}>
                  {cat.subcategories.length}{" "}
                  {cat.subcategories.length === 1 ? (l === "sr" ? "rad" : "work") : l === "sr" ? "radova" : "works"}
                </div>
              </div>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: isSelected ? "2px solid var(--acc)" : "2px solid var(--bdr2)",
                  background: isSelected ? "var(--acc)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 10,
                  color: "#fff",
                }}
              >
                {isSelected && "✓"}
              </div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p style={{ marginTop: 14, fontSize: "0.8125rem", color: "var(--ink3)" }}>
          {l === "sr"
            ? `Izabrano ${selected.length} od ${allIds.length} kategorija`
            : `Selected ${selected.length} of ${allIds.length} categories`}
        </p>
      )}
    </div>
  );
}
