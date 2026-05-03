import type { WizardField } from "../wizardTree/types";
import type { WizardI18n } from "./wizardI18n";

type Props = {
  field: WizardField;
  value: unknown;
  allValues: Record<string, unknown>;
  lang: string;
  i18n: WizardI18n;
  onChange: (key: string, value: unknown) => void;
};

function isVisible(field: WizardField, allValues: Record<string, unknown>): boolean {
  if (!field.showWhen) return true;
  return Object.entries(field.showWhen).every(([key, expected]) => {
    const current = allValues[key];
    if (typeof expected === "boolean") return Boolean(current) === expected;
    if (Array.isArray(current)) return current.includes(expected);
    return current === expected;
  });
}

export function FieldRenderer({ field, value, allValues, lang, i18n, onChange }: Props) {
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";

  if (!isVisible(field, allValues)) return null;

  const label = field.label[l];
  const help = field.help?.[l];
  const placeholder = field.placeholder?.[l];
  const isRequired = field.importance === "required";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink2)" }}>{label}</span>
        {isRequired ? (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "1px 6px",
              borderRadius: 4,
              textTransform: "uppercase" as const,
              letterSpacing: "0.04em",
              background: "var(--accbg)",
              color: "var(--acc)",
            }}
          >
            {i18n.required}
          </span>
        ) : (
          field.importance !== "niceToHave" && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 4,
                textTransform: "uppercase" as const,
                letterSpacing: "0.04em",
                background: "var(--bgw)",
                color: "var(--ink4)",
              }}
            >
              {i18n.optional}
            </span>
          )
        )}
      </div>

      {help && (
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--ink3)", lineHeight: 1.45 }}>{help}</p>
      )}

      {(field.kind === "number" || field.kind === "area" || field.kind === "length") && (
        <NumberField
          field={field}
          value={value}
          lang={l}
          i18n={i18n}
          placeholder={placeholder}
          onChange={(v) => onChange(field.key, v)}
        />
      )}

      {field.kind === "text" && (
        <textarea
          className="finput"
          rows={2}
          value={typeof value === "string" ? value : ""}
          placeholder={placeholder ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          style={{ resize: "vertical", minHeight: 60 }}
        />
      )}

      {field.kind === "toggle" && (
        <ToggleField
          value={value}
          i18n={i18n}
          onChange={(v) => onChange(field.key, v)}
        />
      )}

      {field.kind === "select" && field.options && (
        <select
          className="fselect"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.key, e.target.value || undefined)}
        >
          <option value="">{l === "sr" ? "— Izaberite —" : "— Select —"}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label[l]}
            </option>
          ))}
        </select>
      )}

      {field.kind === "chips" && field.options && (
        <ChipsField
          options={field.options}
          value={Array.isArray(value) ? (value as string[]) : []}
          lang={l}
          onChange={(v) => onChange(field.key, v)}
        />
      )}
    </div>
  );
}

// ── Number field with predefined chips ───────────────────────────────────────

type NumberFieldProps = {
  field: WizardField;
  value: unknown;
  lang: "sr" | "en" | "ru";
  i18n: WizardI18n;
  placeholder?: string;
  onChange: (v: number | "unknown" | undefined) => void;
};

function NumberField({ field, value, lang, i18n, placeholder, onChange }: NumberFieldProps) {
  const isUnknown = value === "unknown";
  const numVal = typeof value === "number" ? value : undefined;

  function selectPredefined(n: number) {
    onChange(numVal === n ? undefined : n);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {field.predefined && field.predefined.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {field.predefined.map((n) => {
            const active = numVal === n && !isUnknown;
            return (
              <button
                key={n}
                onClick={() => selectPredefined(n)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 100,
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  border: active ? "1.5px solid var(--acc)" : "1.5px solid var(--bdr)",
                  background: active ? "var(--acc)" : "var(--card)",
                  color: active ? "#fff" : "var(--ink2)",
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                {n} {field.unit}
              </button>
            );
          })}
          {field.unknownAllowed && (
            <button
              onClick={() => onChange(isUnknown ? undefined : "unknown")}
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: isUnknown ? "1.5px solid var(--ink3)" : "1.5px dashed var(--bdr2)",
                background: isUnknown ? "var(--bgw)" : "transparent",
                color: isUnknown ? "var(--ink2)" : "var(--ink4)",
                cursor: "pointer",
                transition: "all .12s",
              }}
            >
              {i18n.unknownValue}
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          className="finput"
          type="number"
          min={0}
          step={field.kind === "area" || field.kind === "length" ? 0.5 : 1}
          placeholder={placeholder ?? (lang === "sr" ? "Unesi vrednost..." : "Enter value...")}
          value={isUnknown ? "" : numVal ?? ""}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(isNaN(n) ? undefined : n);
          }}
          style={{ maxWidth: 140 }}
          disabled={isUnknown}
        />
        {field.unit && (
          <span style={{ fontSize: "0.875rem", color: "var(--ink3)", fontWeight: 500 }}>
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Toggle (yes / no) field ───────────────────────────────────────────────────

type ToggleFieldProps = {
  value: unknown;
  i18n: WizardI18n;
  onChange: (v: boolean | undefined) => void;
};

function ToggleField({ value, i18n, onChange }: ToggleFieldProps) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[true, false].map((bool) => {
        const active = value === bool;
        const isYes = bool === true;
        return (
          <button
            key={String(bool)}
            onClick={() => onChange(active ? undefined : bool)}
            style={{
              padding: "7px 20px",
              borderRadius: 100,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .12s",
              border: active
                ? isYes
                  ? "1.5px solid var(--grn)"
                  : "1.5px solid var(--bdr2)"
                : "1.5px solid var(--bdr)",
              background: active
                ? isYes
                  ? "var(--grn)"
                  : "var(--bdr2)"
                : "var(--card)",
              color: active ? (isYes ? "#fff" : "var(--ink)") : "var(--ink2)",
            }}
          >
            {isYes ? i18n.yes : i18n.no}
          </button>
        );
      })}
    </div>
  );
}

// ── Chips (multi-select) field ────────────────────────────────────────────────

type ChipsFieldProps = {
  options: { value: string; label: Record<string, string> }[];
  value: string[];
  lang: string;
  onChange: (v: string[]) => void;
};

function ChipsField({ options, value, lang, onChange }: ChipsFieldProps) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            style={{
              padding: "6px 13px",
              borderRadius: 100,
              fontSize: "0.8125rem",
              fontWeight: active ? 600 : 500,
              border: active ? "1.5px solid var(--acc)" : "1.5px solid var(--bdr)",
              background: active ? "var(--accbg)" : "var(--card)",
              color: active ? "var(--acc)" : "var(--ink2)",
              cursor: "pointer",
              transition: "all .12s",
            }}
          >
            {opt.label[lang] ?? opt.label["sr"]}
          </button>
        );
      })}
    </div>
  );
}
