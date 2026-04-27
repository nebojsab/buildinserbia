import { NextResponse } from "next/server";
import { getIntakeEventReport } from "@shared/lib/planner-intake/eventStore";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const daysRaw = url.searchParams.get("days");
  const daysNum = daysRaw ? Number(daysRaw) : 7;

  try {
    const report = getIntakeEventReport(daysNum);
    return NextResponse.json({
      ...report,
      note: "MVP in-memory aggregate (per running process). Connect persistent storage for production-grade analytics.",
    });
  } catch {
    return NextResponse.json({ error: "planner-intake-report-failed" }, { status: 500 });
  }
}
