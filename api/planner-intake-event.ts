type IntakeEventBody = {
  event?: string;
  ts?: number;
  locale?: "sr" | "en" | "ru";
  confidence?: number;
  parentCategory?: string;
  parentCategoryLabel?: string;
  taskCount?: number;
  taskKeys?: string[];
  taskLabels?: string[];
};
import { isIntakeEventName, recordIntakeEvent } from "../src/lib/planner-intake/eventStore";

function json(res: any, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const body = (req.body ?? {}) as IntakeEventBody;
    if (!body.event || typeof body.event !== "string" || !isIntakeEventName(body.event)) {
      json(res, 400, { error: "Missing event" });
      return;
    }
    const ts = typeof body.ts === "number" && Number.isFinite(body.ts) ? body.ts : Date.now();
    recordIntakeEvent({
      event: body.event,
      ts,
      locale: body.locale,
      confidence: body.confidence,
      parentCategory: body.parentCategory,
      parentCategoryLabel: body.parentCategoryLabel,
      taskCount: body.taskCount,
      taskKeys: Array.isArray(body.taskKeys) ? body.taskKeys : undefined,
      taskLabels: Array.isArray(body.taskLabels) ? body.taskLabels : undefined,
    });
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.info("[planner-intake-event]", body);
    }
    res.statusCode = 204;
    res.end();
  } catch {
    json(res, 500, { error: "planner-intake-event-failed" });
  }
}
