import { NextResponse } from "next/server";
import { bulkRemoveCatalogProducts } from "@/lib/catalogAdminState";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as { items?: Array<{ id: string; isCustom: boolean }> };
  if (!Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }
  await bulkRemoveCatalogProducts(body.items);
  return NextResponse.json({ ok: true });
}
