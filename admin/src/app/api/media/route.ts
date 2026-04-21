import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  createMediaItem,
  isMediaStoreUnavailableError,
  listMediaItems,
} from "@/lib/mediaLibraryServer";
import {
  isSupportedMediaFile,
  mediaKindFromFileName,
  type MediaKind,
} from "@/lib/mediaLibraryStore";

function safeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

function normalizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const entry of input) {
    if (typeof entry !== "string") continue;
    const normalized = entry.trim().replace(/\s+/g, " ");
    if (!normalized) continue;
    const lower = normalized.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    categories.push(normalized);
  }
  return categories;
}

function isBlobTokenMissing(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /BLOB_READ_WRITE_TOKEN|No token found|token/i.test(error.message);
}

export async function GET() {
  try {
    const items = await listMediaItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/media failed", error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        { error: "Media model nije ucitan. Restartuj admin server da povuce novi Prisma client." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Ne mogu da ucitam media biblioteku." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const name = String(formData.get("name") ?? "").trim();
    const rawCategories = String(formData.get("categories") ?? "[]");
    const parsedCategories = normalizeCategories(JSON.parse(rawCategories));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nedostaje fajl za upload." }, { status: 400 });
    }
    if (!isSupportedMediaFile(file.name)) {
      return NextResponse.json(
        { error: "Podrzani formati su: jpg, png, svg, webp, mp4." },
        { status: 400 },
      );
    }

    const kind = mediaKindFromFileName(file.name) as MediaKind | null;
    if (!kind) {
      return NextResponse.json({ error: "Nepodrzan tip fajla." }, { status: 400 });
    }

    const blob = await put(`media/${Date.now()}-${safeFileName(file.name)}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const item = await createMediaItem({
      name: name || file.name,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      url: blob.url,
      kind,
      categories: parsedCategories,
      blobPath: blob.pathname,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/media failed", error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        { error: "Media model nije ucitan. Restartuj admin server pa pokusaj ponovo." },
        { status: 503 },
      );
    }
    if (isBlobTokenMissing(error)) {
      return NextResponse.json(
        {
          error:
            "Nedostaje BLOB_READ_WRITE_TOKEN. U lokalnom okruzenju dodaj ga u admin/.env.local pa restartuj server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Upload nije uspeo. Proveri Vercel Blob konfiguraciju i bazu." },
      { status: 500 },
    );
  }
}
