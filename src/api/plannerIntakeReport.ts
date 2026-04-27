export type PlannerIntakeReport = {
  days: number;
  generatedAt: string;
  totals: {
    intake_started: number;
    intake_reviewed: number;
    intake_confirmed: number;
    intake_fallback: number;
    intake_clarification_opened: number;
    intake_clarification_completed: number;
  };
  rates: {
    fallbackRateFromReviewed: number;
    confirmationRateFromReviewed: number;
    clarificationRateFromReviewed: number;
  };
  byDay: Array<{
    day: string;
    reviewed: number;
    confirmed: number;
    fallback: number;
    clarificationOpened: number;
    avgConfidenceReviewed: number | null;
  }>;
  note?: string;
};

export async function fetchPlannerIntakeReport(days = 7): Promise<PlannerIntakeReport> {
  const response = await fetch(`/api/planner-intake-report?days=${days}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch planner intake report");
  }
  return (await response.json()) as PlannerIntakeReport;
}
