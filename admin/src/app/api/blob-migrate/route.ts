/**
 * One-time migration endpoint: reads the legacy public blob and saves it
 * as a private blob so future reads bypass CDN entirely.
 *
 * GET  → shows what's currently in the public blob (for verification)
 * POST → migrates public → private blob and returns the migrated JSON
 */
import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BLOB_PATH = "catalog-admin-state.json";

async function readPublicBlobDirect(): Promise<string> {
  // Read via authenticated get() — this goes to origin storage with the
  // BLOB_READ_WRITE_TOKEN, which on Vercel's own infrastructure typically
  // bypasses the public CDN cache (same datacenter routing).
  // We intentionally do NOT fetch the CDN blobUrl again; we only use the stream
  // returned by get() which comes from the origin-facing response.
  // Note: useCache: false causes 400 for public blobs — omit it.
  // The stream from get() with the BLOB_READ_WRITE_TOKEN auth header routes
  // through Vercel's internal network and should return origin-fresh data.
  const result = await get(BLOB_PATH, { access: "public" });

  if (!result || result.statusCode !== 200) {
    throw new Error(`Public blob not found or unavailable (status ${result?.statusCode ?? "null"})`);
  }

  const stream = result.stream as ReadableStream<Uint8Array>;
  return new Response(stream).text();
}

export async function GET() {
  await requireAuth();

  try {
    const text = await readPublicBlobDirect();
    return new NextResponse(text, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-blob-source": "public-origin-stream",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  await requireAuth();

  try {
    const text = await readPublicBlobDirect();

    // Validate it's real JSON before saving
    JSON.parse(text);

    await put(BLOB_PATH, text, {
      access: "private",
      allowOverwrite: true,
    });

    return NextResponse.json({
      ok: true,
      message: "Migrated public → private blob. All future reads will use the private blob.",
      preview: text.slice(0, 500),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
