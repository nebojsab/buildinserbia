import type { PlannerIntakeResult } from "../../../types/plannerIntake";

type IntakeReviewLabels = {
  title: string;
  understood: string;
  detectedParent: string;
  detectedTasks: string;
  extractedValues: string;
  missing: string;
  assumptions: string;
  confidence: string;
  confirm: string;
  edit: string;
  fallback: string;
};

type Props = {
  result: PlannerIntakeResult;
  labels: IntakeReviewLabels;
  categoryLabelMap: Record<string, string>;
  taskLabelMap: Record<string, string>;
  taskOrderMap: Record<string, number>;
  fieldLabelMap: Record<string, string>;
  mixedScopeHint?: string;
  onConfirm: () => void;
  onEdit: () => void;
  onFallback: () => void;
};

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function IntakeReview({
  result,
  labels,
  categoryLabelMap,
  taskLabelMap,
  taskOrderMap,
  fieldLabelMap,
  mixedScopeHint,
  onConfirm,
  onEdit,
  onFallback,
}: Props) {
  const valueEntries = Object.entries(result.plannerPrefill.knownValues);
  const parentLabel = categoryLabelMap[result.parentCategory] ?? result.parentCategory;
  const orderedTasks = [...result.childTasks].sort((a, b) => {
    const ia = taskOrderMap[a] ?? Number.MAX_SAFE_INTEGER;
    const ib = taskOrderMap[b] ?? Number.MAX_SAFE_INTEGER;
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });
  return (
    <div className="card" style={{ padding: "16px 16px 14px" }}>
      <h3 style={{ fontFamily: "var(--heading)", fontSize: 22, margin: 0 }}>{labels.title}</h3>
      <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--ink3)", lineHeight: 1.5 }}>{labels.understood}</p>

      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--ink3)" }}>{labels.detectedParent}</p>
          <span className="pill">{parentLabel}</span>
        </div>

        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--ink3)" }}>{labels.detectedTasks}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {orderedTasks.length > 0
              ? orderedTasks.map((task) => (
                  <span className="pill" key={task}>
                    {taskLabelMap[task] ?? humanizeKey(task)}
                  </span>
                ))
              : <span className="pill">—</span>}
          </div>
        </div>

        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--ink3)" }}>{labels.extractedValues}</p>
          <div style={{ display: "grid", gap: 6 }}>
            {valueEntries.length > 0 ? valueEntries.map(([key, value]) => (
              <p key={key} style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
                <strong>{fieldLabelMap[key] ?? humanizeKey(key)}</strong>: {Array.isArray(value) ? value.join(", ") : String(value)}
              </p>
            )) : <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink4)" }}>—</p>}
          </div>
        </div>

        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--ink3)" }}>{labels.missing}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {result.plannerPrefill.unknownFieldKeys.length > 0
              ? result.plannerPrefill.unknownFieldKeys.map((key) => (
                  <span className="pill" key={key}>
                    {fieldLabelMap[key] ?? humanizeKey(key)}
                  </span>
                ))
              : <span className="pill">—</span>}
          </div>
        </div>

        {result.assumptions.length > 0 ? (
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 700, color: "var(--ink3)" }}>{labels.assumptions}</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--ink2)" }}>
              {result.assumptions.slice(0, 3).map((assumption) => <li key={assumption}>{assumption}</li>)}
            </ul>
          </div>
        ) : null}

        <p style={{ margin: 0, fontSize: 12, color: "var(--ink3)" }}>
          {labels.confidence}: <strong>{Math.round(result.confidence.overall * 100)}%</strong>
        </p>
        {mixedScopeHint ? (
          <p style={{ margin: 0, fontSize: 12, color: "var(--ink3)", lineHeight: 1.5 }}>
            {mixedScopeHint}
          </p>
        ) : null}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" className="btn-p" onClick={onConfirm}>{labels.confirm}</button>
        <button type="button" className="btn-g" onClick={onEdit}>{labels.edit}</button>
        <button type="button" className="btn-g" onClick={onFallback}>{labels.fallback}</button>
      </div>
    </div>
  );
}
