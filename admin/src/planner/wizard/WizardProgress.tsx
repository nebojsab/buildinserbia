import { Fragment } from "react";
import type { WizardI18n } from "./wizardI18n";

type Props = {
  step: number;
  i18n: WizardI18n;
  summary?: string;
};

export function WizardProgress({ step, i18n, summary }: Props) {
  const totalSteps = i18n.steps.length;

  return (
    <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        {i18n.steps.map((label, idx) => {
          const done = idx < step;
          const active = idx === step;
          return (
            <Fragment key={idx}>
              {/* Step bubble + label */}
              <div
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    border: done ? "2px solid var(--grn)" : active ? "2px solid var(--acc)" : "2px solid var(--bdr2)",
                    background: done ? "var(--grn)" : active ? "var(--acc)" : "var(--card)",
                    color: done || active ? "#fff" : "var(--ink4)",
                    transition: "all .25s",
                  }}
                >
                  {done ? "✓" : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    color: done ? "var(--grn)" : active ? "var(--acc)" : "var(--ink4)",
                    whiteSpace: "nowrap",
                    transition: "color .25s",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector line — flex: 1 stretches between bubbles */}
              {idx < totalSteps - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    minWidth: 8,
                    background: idx < step ? "var(--grn)" : "var(--bdr2)",
                    margin: "13px 4px 0",
                    transition: "background .25s",
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {summary && (
        <div style={{
          fontSize: "0.75rem",
          color: "var(--ink4)",
          fontWeight: 500,
          letterSpacing: "0.01em",
          paddingLeft: 2,
          minHeight: "1em",
          transition: "opacity .3s",
        }}>
          {summary}
        </div>
      )}
    </div>
  );
}
