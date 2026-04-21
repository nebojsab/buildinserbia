import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  deleteMediaItemById,
  getMediaItemById,
  isMediaStoreUnavailableError,
  updateMediaItemById,
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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const existing = await getMediaItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "Media fajl nije pronadjen." }, { status: 404 });
    }

    await deleteMediaItemById(id);

    if (existing.blobPath) {
      await del(existing.blobPath);
    } else {
      await del(existing.url);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/media/${id} failed`, error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        { error: "Media model nije ucitan. Restartuj admin server pa pokusaj ponovo." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Brisanje media fajla nije uspelo." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const payload = (await request.json().catch(() => null)) as
      | { name?: string; categories?: unknown }
      | null;
    const name = payload?.name;
    const categories = payload?.categories;
    const existing = await getMediaItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "Media fajl nije pronadjen." }, { status: 404 });
    }
    const updated = await updateMediaItemById(id, {
      ...(typeof name === "string" ? { name: name.trim() || existing.name } : {}),
      ...(categories !== undefined ? { categories: normalizeCategories(categories) } : {}),
    });
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error(`PATCH /api/media/${id} failed`, error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        { error: "Media model nije ucitan. Restartuj admin server pa pokusaj ponovo." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Ažuriranje media fajla nije uspelo." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const existing = await getMediaItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "Media fajl nije pronadjen." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const name = String(formData.get("name") ?? "").trim() || existing.name;
    const rawCategories = String(formData.get("categories") ?? "[]");
    const categories = normalizeCategories(JSON.parse(rawCategories));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nedostaje fajl za replace." }, { status: 400 });
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

    const updated = await updateMediaItemById(id, {
      name,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      url: blob.url,
      kind,
      categories,
      blobPath: blob.pathname,
    });

    if (existing.blobPath) {
      await del(existing.blobPath).catch(() => null);
    } else {
      await del(existing.url).catch(() => null);
    }

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error(`PUT /api/media/${id} failed`, error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        { error: "Media model nije ucitan. Restartuj admin server pa pokusaj ponovo." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Replace media fajla nije uspeo." }, { status: 500 });
  }
}
