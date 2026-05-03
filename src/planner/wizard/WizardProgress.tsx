import type { WizardI18n } from "./wizardI18n";

type Props = {
  step: number;
  i18n: WizardI18n;
};

export function WizardProgress({ step, i18n }: Props) {
  const totalSteps = i18n.steps.length;

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: 4,
        }}
      >
        {i18n.steps.map((label, idx) => {
          const done = idx < step;
          const active = idx === step;
          return (
            <div
              key={idx}
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
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
                    border: done
                      ? "2px solid var(--grn)"
                      : active
                      ? "2px solid var(--acc)"
                      : "2px solid var(--bdr2)",
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
                    color: done
                      ? "var(--grn)"
                      : active
                      ? "var(--acc)"
                      : "var(--ink4)",
                    whiteSpace: "nowrap",
                    transition: "color .25s",
                  }}
                >
                  {label}
                </span>
              </div>
              {idx < totalSteps - 1 && (
                <div
                  style={{
                    width: 24,
                    height: 2,
                    background: idx < step ? "var(--grn)" : "var(--bdr2)",
                    margin: "0 4px",
                    marginBottom: 16,
                    flexShrink: 0,
                    transition: "background .25s",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
