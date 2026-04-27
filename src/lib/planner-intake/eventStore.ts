export type IntakeEventName =
  | "intake_started"
  | "intake_reviewed"
  | "intake_confirmed"
  | "intake_fallback"
  | "intake_clarification_opened"
  | "intake_clarification_completed";

export type IntakeEventRecord = {
  event: IntakeEventName;
  ts: number;
  locale?: "sr" | "en" | "ru";
  confidence?: number;
  parentCategory?: string;
  parentCategoryLabel?: string;
  taskCount?: number;
  taskKeys?: string[];
  taskLabels?: string[];
};

type IntakeStore = {
  events: IntakeEventRecord[];
  maxEvents: number;
};

const STORE_KEY = "__plannerIntakeEventStore";

function getStore(): IntakeStore {
  const g = globalThis as Record<string, unknown>;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { events: [], maxEvents: 10_000 } satisfies IntakeStore;
  }
  return g[STORE_KEY] as IntakeStore;
}

export function isIntakeEventName(value: string): value is IntakeEventName {
  return (
    value === "intake_started" ||
    value === "intake_reviewed" ||
    value === "intake_confirmed" ||
    value === "intake_fallback" ||
    value === "intake_clarification_opened" ||
    value === "intake_clarification_completed"
  );
}

export function recordIntakeEvent(record: IntakeEventRecord): void {
  const store = getStore();
  store.events.push(record);
  if (store.events.length > store.maxEvents) {
    store.events.splice(0, store.events.length - store.maxEvents);
  }
}

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function getIntakeEventReport(days = 7): {
  days: number;
  generatedAt: string;
  totals: Record<IntakeEventName, number>;
  rates: {
    fallbackRateFromReviewed: number;
    confirmationRateFromReviewed: number;
    clarificationRateFromReviewed: number;
  };
  byDay: Array<{
    day: string;
    counts: Record<IntakeEventName, number>;
    reviewed: number;
    confirmed: number;
    fallback: number;
    clarificationOpened: number;
    avgConfidenceReviewed: number | null;
  }>;
} {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(60, Math.floor(days))) : 7;
  const now = Date.now();
  const minTs = now - safeDays * 24 * 60 * 60 * 1000;
  const records = getStore().events.filter((e) => e.ts >= minTs);
  const emptyCounts = (): Record<IntakeEventName, number> => ({
    intake_started: 0,
    intake_reviewed: 0,
    intake_confirmed: 0,
    intake_fallback: 0,
    intake_clarification_opened: 0,
    intake_clarification_completed: 0,
  });
  const byDayMap = new Map<
    string,
    { counts: Record<IntakeEventName, number>; confidenceSum: number; confidenceCount: number }
  >();
  const totals = emptyCounts();

  for (const record of records) {
    totals[record.event] += 1;
    const key = dayKey(record.ts);
    const row = byDayMap.get(key) ?? { counts: emptyCounts(), confidenceSum: 0, confidenceCount: 0 };
    row.counts[record.event] += 1;
    if (record.event === "intake_reviewed" && typeof record.confidence === "number") {
      row.confidenceSum += record.confidence;
      row.confidenceCount += 1;
    }
    byDayMap.set(key, row);
  }

  const reviewed = totals.intake_reviewed || 0;
  const byDay = Array.from(byDayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, row]) => ({
      day,
      counts: row.counts,
      reviewed: row.counts.intake_reviewed,
      confirmed: row.counts.intake_confirmed,
      fallback: row.counts.intake_fallback,
      clarificationOpened: row.counts.intake_clarification_opened,
      avgConfidenceReviewed:
        row.confidenceCount > 0 ? Number((row.confidenceSum / row.confidenceCount).toFixed(4)) : null,
    }));

  return {
    days: safeDays,
    generatedAt: new Date(now).toISOString(),
    totals,
    rates: {
      fallbackRateFromReviewed: reviewed > 0 ? Number((totals.intake_fallback / reviewed).toFixed(4)) : 0,
      confirmationRateFromReviewed: reviewed > 0 ? Number((totals.intake_confirmed / reviewed).toFixed(4)) : 0,
      clarificationRateFromReviewed:
        reviewed > 0 ? Number((totals.intake_clarification_opened / reviewed).toFixed(4)) : 0,
    },
    byDay,
  };
}
