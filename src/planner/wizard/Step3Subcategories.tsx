import type { WizardProjectTree } from "../wizardTree/types";
import type { WizardI18n } from "./wizardI18n";
import { WizardIcon } from "./WizardIcon";

type Props = {
  lang: string;
  tree: WizardProjectTree;
  selectedCategories: string[];
  selected: string[];
  onChange: (ids: string[]) => void;
  i18n: WizardI18n;
};

function toggle(arr: string[], id: string) {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

function toggleGroup(arr: string[], ids: string[]) {
  const allIn = ids.every((id) => arr.includes(id));
  return allIn ? arr.filter((x) => !ids.includes(x)) : [...arr.filter((x) => !ids.includes(x)), ...ids];
}

export function Step3Subcategories({
  lang,
  tree,
  selectedCategories,
  selected,
  onChange,
  i18n,
}: Props) {
  const l = lang === "en" ? "en" : "sr";
  const activeCats = tree.categories.filter((c) => selectedCategories.includes(c.id));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)" }}>
          {i18n.step3Title}
        </h2>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink3)" }}>{i18n.step3Sub}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {activeCats.map((cat) => {
          const subIds = cat.subcategories.map((s) => s.id);
          const groupAllSelected = subIds.every((id) => selected.includes(id));

          return (
            <div key={cat.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--ink3)",
                  }}
                >
                  <div style={{ color: "var(--acc)", display: "flex", alignItems: "center" }}>
                    <WizardIcon name={cat.icon} size={14} />
                  </div>
                  {cat.label[l]}
                </div>
                <button
                  style={{
                    fontSize: 11,
                    color: "var(--acc)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px 6px",
                    fontWeight: 600,
                  }}
                  onClick={() => onChange(toggleGroup(selected, subIds))}
                >
                  {groupAllSelected ? i18n.deselectAll : i18n.selectAll}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cat.subcategories.map((sub) => {
                  const isSelected = selected.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onChange(toggle(selected, sub.id))}
                      style={{
                        border: isSelected ? "2px solid var(--acc)" : "2px solid var(--bdr)",
                        borderRadius: "var(--r)",
                        padding: "11px 14px",
                        cursor: "pointer",
                        background: isSelected ? "var(--accbg)" : "var(--card)",
                        transition: "all .15s",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 10,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "var(--ink)",
                            lineHeight: 1.3,
                            marginBottom: sub.description ? 3 : 0,
                          }}
                        >
                          {sub.label[l]}
                        </div>
                        {sub.description && (
                          <div style={{ fontSize: "0.8125rem", color: "var(--ink3)", lineHeight: 1.4 }}>
                            {sub.description[l]}
                          </div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "var(--ink4)", marginTop: 4 }}>
                          {sub.fields.length}{" "}
                          {l === "sr"
                            ? sub.fields.length === 1 ? "pitanje" : "pitanja"
                            : sub.fields.length === 1 ? "field" : "fields"}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: isSelected ? "2px solid var(--acc)" : "2px solid var(--bdr2)",
                          background: isSelected ? "var(--acc)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 11,
                          color: "#fff",
                          marginTop: 2,
                        }}
                      >
                        {isSelected && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p style={{ marginTop: 16, fontSize: "0.8125rem", color: "var(--ink3)" }}>
          {l === "sr"
            ? `Izabrano ${selected.length} vrsta radova`
            : `${selected.length} works selected`}
        </p>
      )}
    </div>
  );
}
