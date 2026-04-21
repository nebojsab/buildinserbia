import { NextResponse } from "next/server";
import type { BaseContentItem } from "@shared/content/types";
import {
  getServerContentByType,
  saveServerContentByType,
} from "@/lib/contentStoreServer";

function readType(url: string): "document" | "blog" | null {
  const type = new URL(url).searchParams.get("type");
  if (type === "document" || type === "blog") return type;
  return null;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  const type = readType(request.url);
  if (!type) {
    return NextResponse.json({ error: "Missing or invalid type." }, { status: 400 });
  }
  try {
    const items = await getServerContentByType(type);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/content failed", error);
    return NextResponse.json({ error: "Failed to load content." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const type = readType(request.url);
  if (!type) {
    return NextResponse.json({ error: "Missing or invalid type." }, { status: 400 });
  }
  try {
    const payload = (await request.json().catch(() => null)) as
      | { items?: BaseContentItem[] }
      | null;
    const items = Array.isArray(payload?.items) ? payload.items : null;
    if (!items) {
      return NextResponse.json({ error: "Invalid items payload." }, { status: 400 });
    }
    if (items.some((item) => item.type !== type)) {
      return NextResponse.json({ error: "Type mismatch in items payload." }, { status: 400 });
    }
    await saveServerContentByType(type, items);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/content failed", error);
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  }
}
