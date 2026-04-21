import { NextResponse } from "next/server";
import { listMediaItems } from "@/lib/mediaLibraryServer";

export const runtime = "nodejs";

type HealthStatus = "ok" | "fail";

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export async function GET() {
  let dbStatus: HealthStatus = "ok";
  let dbMessage = "Baza je dostupna.";

  try {
    await listMediaItems();
  } catch (error) {
    dbStatus = "fail";
    dbMessage = normalizeError(error);
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const blobStatus: HealthStatus = blobToken ? "ok" : "fail";
  const blobMessage = blobToken
    ? "Blob token je prisutan."
    : "Nedostaje BLOB_READ_WRITE_TOKEN u env-u.";

  return NextResponse.json({
    db: { status: dbStatus, message: dbMessage },
    blob: { status: blobStatus, message: blobMessage },
    overall: dbStatus === "ok" && blobStatus === "ok" ? "ok" : "fail",
  });
}
