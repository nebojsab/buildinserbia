import type { WizardProjectTree, WizardSubcategory } from "../wizardTree/types";
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

function toggleGroup(arr: string[], ids: string[]) {
  const allIn = ids.every((id) => arr.includes(id));
  return allIn ? arr.filter((x) => !ids.includes(x)) : [...arr.filter((x) => !ids.includes(x)), ...ids];
}

function toggleSub(
  selected: string[],
  clickedId: string,
  siblings: WizardSubcategory[]
): string[] {
  const clicked = siblings.find((s) => s.id === clickedId);
  const siblingIds = siblings.map((s) => s.id);
  const exclusiveIds = siblings.filter((s) => s.exclusive).map((s) => s.id);
  const isCurrentlySelected = selected.includes(clickedId);

  if (clicked?.exclusive) {
    if (isCurrentlySelected) {
      return selected.filter((id) => id !== clickedId);
    }
    // Select only this exclusive sub, deselect all siblings
    return [...selected.filter((id) => !siblingIds.includes(id)), clickedId];
  } else {
    // Non-exclusive: remove any exclusive sibling when selecting
    let next = isCurrentlySelected
      ? selected.filter((id) => id !== clickedId)
      : [...selected.filter((id) => !exclusiveIds.includes(id)), clickedId];
    return next;
  }
}

export function Step3Subcategories({
  lang,
  tree,
  selectedCategories,
  selected,
  onChange,
  i18n,
}: Props) {
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
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
          const nonExclusiveIds = cat.subcategories.filter((s) => !s.exclusive).map((s) => s.id);
          const hasExclusive = cat.subcategories.some((s) => s.exclusive);
          // All exclusive = radio group: pick exactly one, no "KOMPLETAN" badge or block message
          const allExclusive = cat.subcategories.length > 0 && cat.subcategories.every((s) => s.exclusive);
          const exclusiveSelected = cat.subcategories.some((s) => s.exclusive && selected.includes(s.id));
          // "Select all" targets only non-exclusive items (exclusive items are standalone options)
          const selectableIds = hasExclusive ? nonExclusiveIds : subIds;
          const groupAllSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id));

          return (
            <div key={cat.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink3)" }}>
                  <div style={{ color: "var(--acc)", display: "flex", alignItems: "center" }}>
                    <WizardIcon name={cat.icon} size={14} />
                  </div>
                  {cat.label[l]}
                </div>
                {selectableIds.length > 0 && (
                  <button
                    disabled={exclusiveSelected}
                    style={{
                      fontSize: 11,
                      color: exclusiveSelected ? "var(--ink4)" : "var(--acc)",
                      background: "none",
                      border: "none",
                      cursor: exclusiveSelected ? "not-allowed" : "pointer",
                      padding: "2px 6px",
                      fontWeight: 600,
                      opacity: exclusiveSelected ? 0.45 : 1,
                    }}
                    onClick={() => !exclusiveSelected && onChange(toggleGroup(selected, selectableIds))}
                  >
                    {groupAllSelected ? i18n.deselectAll : i18n.selectAll}
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cat.subcategories.map((sub) => {
                  const isSelected = selected.includes(sub.id);
                  const isDisabled = !isSelected && exclusiveSelected && !sub.exclusive;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => !isDisabled && onChange(toggleSub(selected, sub.id, cat.subcategories))}
                      style={{
                        border: isSelected
                          ? "2px solid var(--acc)"
                          : isDisabled
                            ? "2px solid var(--bdr)"
                            : "2px solid var(--bdr)",
                        borderRadius: "var(--r)",
                        padding: "11px 14px",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        background: isSelected ? "var(--accbg)" : "var(--card)",
                        opacity: isDisabled ? 0.4 : 1,
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
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: sub.description ? 3 : 0 }}>
                          {sub.exclusive && !allExclusive && (
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--acc)", background: "var(--accbg)", border: "1px solid var(--accmid)", borderRadius: 4, padding: "1px 6px", marginRight: 7, verticalAlign: "middle" }}>
                              {l === "sr" ? "kompletan" : "full scope"}
                            </span>
                          )}
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
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: isSelected ? "2px solid var(--acc)" : "2px solid var(--bdr2)", background: isSelected ? "var(--acc)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, color: "#fff", marginTop: 2 }}>
                        {isSelected && "✓"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {exclusiveSelected && !allExclusive && (
                <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--ink4)", fontStyle: "italic" }}>
                  {l === "sr"
                    ? "Odabran kompletan radovi — ostale opcije nisu dostupne."
                    : "Full scope selected — other options are unavailable."}
                </p>
              )}
              {allExclusive && exclusiveSelected && (
                <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--ink4)", fontStyle: "italic" }}>
                  {l === "sr"
                    ? "Izaberite jednu od ponuđenih opcija."
                    : l === "ru"
                      ? "Выберите один из предложенных вариантов."
                      : "Select one of the available options."}
                </p>
              )}
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
