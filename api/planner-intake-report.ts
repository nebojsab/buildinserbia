import { getIntakeEventReport } from "../src/lib/planner-intake/eventStore";

function json(res: any, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const daysRaw = req.query?.days;
    const daysNum =
      typeof daysRaw === "string"
        ? Number(daysRaw)
        : Array.isArray(daysRaw) && typeof daysRaw[0] === "string"
          ? Number(daysRaw[0])
          : 7;
    const report = getIntakeEventReport(daysNum);
    json(res, 200, {
      ...report,
      note: "MVP in-memory aggregate (per running process). Connect persistent storage for production-grade analytics.",
    });
  } catch {
    json(res, 500, { error: "planner-intake-report-failed" });
  }
}
