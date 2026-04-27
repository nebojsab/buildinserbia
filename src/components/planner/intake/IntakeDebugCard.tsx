import { useEffect, useMemo, useState } from "react";
import { fetchPlannerIntakeReport, type PlannerIntakeReport } from "../../../api/plannerIntakeReport";
import type { Lang } from "../../../translations";

type Props = {
  lang: Lang;
  days?: number;
};

function asPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function IntakeDebugCard({ lang, days = 7 }: Props) {
  const [report, setReport] = useState<PlannerIntakeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const isDevRuntime =
    (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV));

  const copy = useMemo(() => {
    if (lang === "en") {
      return {
        title: "Intake KPI (debug)",
        subtitle: `Last ${days} day(s), in-memory process view`,
        refresh: "Refresh",
        reviewed: "Reviewed",
        confirmedRate: "Confirmed / reviewed",
        fallbackRate: "Fallback / reviewed",
        clarificationRate: "Clarification / reviewed",
      };
    }
    if (lang === "ru") {
      return {
        title: "KPI intake (debug)",
        subtitle: `Последние ${days} дн., in-memory срез процесса`,
        refresh: "Обновить",
        reviewed: "Проверено",
        confirmedRate: "Подтверждено / проверено",
        fallbackRate: "Fallback / проверено",
        clarificationRate: "Уточнения / проверено",
      };
    }
    return {
      title: "Intake KPI (debug)",
      subtitle: `Poslednjih ${days} dana, in-memory prikaz procesa`,
      refresh: "Osveži",
      reviewed: "Review faza",
      confirmedRate: "Potvrđeno / review",
      fallbackRate: "Fallback / review",
      clarificationRate: "Clarification / review",
    };
  }, [days, lang]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await fetchPlannerIntakeReport(days));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isDevRuntime) return;
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("debugIntake");
    const isEnabled = flag === "1" || flag === "true";
    setEnabled(isEnabled);
    if (!isEnabled) return;
    void load();
  }, [days, isDevRuntime]);

  if (!isDevRuntime || !enabled) return null;

  return (
    <section className="card" style={{ padding: "10px 12px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--ink2)" }}>{copy.title}</p>
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--ink4)" }}>{copy.subtitle}</p>
        </div>
        <button type="button" className="btn-g" onClick={() => void load()} disabled={loading}>
          {copy.refresh}
        </button>
      </div>
      {error ? <p style={{ margin: "8px 0 0", fontSize: 12, color: "#b91c1c" }}>{error}</p> : null}
      {report ? (
        <div style={{ marginTop: 8, display: "grid", gap: 6, fontSize: 12.5, color: "var(--ink2)" }}>
          <p style={{ margin: 0 }}>
            <strong>{copy.reviewed}</strong>: {report.totals.intake_reviewed}
          </p>
          <p style={{ margin: 0 }}>
            <strong>{copy.confirmedRate}</strong>: {asPct(report.rates.confirmationRateFromReviewed)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>{copy.fallbackRate}</strong>: {asPct(report.rates.fallbackRateFromReviewed)}
          </p>
          <p style={{ margin: 0 }}>
            <strong>{copy.clarificationRate}</strong>: {asPct(report.rates.clarificationRateFromReviewed)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
