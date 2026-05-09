import { useState } from "react";
import type { WizardProjectTree } from "../wizardTree/types";
import type { FieldValues } from "./wizardState";
import type { WizardI18n } from "./wizardI18n";
import { FieldRenderer } from "./FieldRenderer";

type Props = {
  lang: string;
  tree: WizardProjectTree;
  selectedSubcategories: string[];
  values: Record<string, FieldValues>;
  onChange: (values: Record<string, FieldValues>) => void;
  i18n: WizardI18n;
};

export function Step4Details({
  lang,
  tree,
  selectedSubcategories,
  values,
  onChange,
  i18n,
}: Props) {
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";

  const selectedSubs = tree.categories
    .flatMap((c) => c.subcategories)
    .filter((s) => selectedSubcategories.includes(s.id));

  const [openIds, setOpenIds] = useState<string[]>([selectedSubs[0]?.id ?? ""]);

  function toggleAccordion(id: string) {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function setFieldValue(subId: string, key: string, value: unknown) {
    onChange({
      ...values,
      [subId]: {
        ...(values[subId] ?? {}),
        [key]: value,
      },
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)" }}>
          {i18n.step4Title}
        </h2>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink3)" }}>{i18n.step4Sub}</p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          padding: "9px 12px",
          background: "var(--blubg)",
          border: "1px solid var(--blumid)",
          borderRadius: "var(--r)",
          fontSize: "0.8125rem",
          color: "var(--blu)",
          marginBottom: 20,
        }}
      >
        <span style={{ flexShrink: 0, marginTop: 1 }}>ℹ</span>
        {i18n.step4Help}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {selectedSubs.map((sub, idx) => {
          const isOpen = openIds.includes(sub.id);
          const subValues = values[sub.id] ?? {};
          const filledCount = Object.values(subValues).filter(
            (v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
          ).length;
          const requiredCount = sub.fields.filter((f) => f.importance === "required").length;
          const isDone = requiredCount > 0 && filledCount >= requiredCount;

          return (
            <div
              key={sub.id}
              style={{
                border: isDone ? "1.5px solid var(--grn)" : "1.5px solid var(--bdr)",
                borderRadius: "var(--rl)",
                overflow: "hidden",
                background: "var(--card)",
                transition: "border-color .2s",
              }}
            >
              <button
                onClick={() => toggleAccordion(sub.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 16px",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: isDone ? "var(--grn)" : "transparent",
                      border: isDone ? "2px solid var(--grn)" : "2px solid var(--bdr2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isDone ? "#fff" : "var(--ink4)",
                      flexShrink: 0,
                      transition: "all .2s",
                    }}
                  >
                    {isDone ? "✓" : ""}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--ink)" }}>
                      {sub.label[l]}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: isDone ? "var(--grn)" : "var(--ink4)", marginTop: 1 }}>
                      {isDone
                        ? (l === "sr" ? "Popunjeno" : l === "ru" ? "Заполнено" : "Done")
                        : filledCount > 0
                          ? (l === "sr" ? `${filledCount} uneseno` : l === "ru" ? `${filledCount} внесено` : `${filledCount} entered`)
                          : ""}
                    </div>
                  </div>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transition: "transform .2s",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--ink3)",
                    flexShrink: 0,
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "4px 16px 18px",
                    borderTop: "1px solid var(--bdr)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  {sub.description && (
                    <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--ink3)", lineHeight: 1.5 }}>
                      {sub.description[l]}
                    </p>
                  )}
                  {sub.fields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={subValues[field.key]}
                      allValues={subValues}
                      lang={lang}
                      i18n={i18n}
                      onChange={(key, val) => setFieldValue(sub.id, key, val)}
                    />
                  ))}
                  {sub.estimateNotes && (
                    <div
                      style={{
                        padding: "8px 12px",
                        background: "var(--ambbg)",
                        border: "1px solid var(--ambmid)",
                        borderRadius: "var(--r)",
                        fontSize: "0.8125rem",
                        color: "var(--amb)",
                        lineHeight: 1.45,
                      }}
                    >
                      {sub.estimateNotes[l]}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
