/**
 * One-time migration helper: reads the legacy fixed-path public blob and
 * re-saves it using the new versioned path strategy so future reads are CDN-safe.
 *
 * GET  → shows what's currently in the legacy blob (verification only, no write)
 * POST → migrates legacy blob → new versioned path, returns summary
 */
import { get, list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LEGACY_PATH = "catalog-admin-state.json";
const VERSIONED_PREFIX = "catalog-admin-state/";

async function readLegacyBlob(): Promise<string> {
  // Try versioned blobs first (in case migration already ran)
  const { blobs } = await list({ prefix: VERSIONED_PREFIX });
  if (blobs.length > 0) {
    blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (res.ok) return res.text();
  }

  // Fall back to legacy fixed-path blob
  const result = await get(LEGACY_PATH, { access: "public" });
  if (!result || result.statusCode !== 200) {
    throw new Error(`Legacy blob not found (status ${result?.statusCode ?? "null"})`);
  }
  const stream = result.stream as ReadableStream<Uint8Array>;
  return new Response(stream).text();
}

export async function GET() {
  await requireAuth();
  try {
    const text = await readLegacyBlob();
    return new NextResponse(text, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  await requireAuth();
  try {
    const text = await readLegacyBlob();
    const parsed = JSON.parse(text) as {
      customProducts?: unknown[];
      productOverrides?: Record<string, unknown>;
    };

    // Write using the new versioned strategy — brand-new URL = CDN-safe read
    const version = Date.now();
    await put(`${VERSIONED_PREFIX}${version}.json`, text, { access: "public" });

    const customCount = Array.isArray(parsed.customProducts) ? parsed.customProducts.length : 0;
    const overrideCount = Object.keys(parsed.productOverrides ?? {}).length;

    return NextResponse.json({
      ok: true,
      message: `Migracija uspešna — ${customCount} custom proizvoda, ${overrideCount} override-a sačuvano u verzionisani blob.`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
