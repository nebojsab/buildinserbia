import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getMediaItemById, deleteMediaItemById } from "@/lib/mediaLibraryServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as { ids?: string[] };
  if (!Array.isArray(body?.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "No ids" }, { status: 400 });
  }
  let deleted = 0;
  let failed = 0;
  for (const id of body.ids) {
    try {
      const existing = await getMediaItemById(id);
      if (!existing) { failed++; continue; }
      await deleteMediaItemById(id);
      if (existing.blobPath) {
        await del(existing.blobPath);
      } else {
        await del(existing.url);
      }
      deleted++;
    } catch {
      failed++;
    }
  }
  return NextResponse.json({ ok: true, deleted, failed });
}
