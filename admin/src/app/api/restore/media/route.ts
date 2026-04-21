import JSZip from "jszip";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { safeFileName } from "@/lib/backupZip";
import {
  createMediaItem,
  isMediaStoreUnavailableError,
} from "@/lib/mediaLibraryServer";
import type { MediaItem, MediaKind } from "@/lib/mediaLibraryStore";

export const runtime = "nodejs";

type FetchResultEntry = {
  id?: string;
  storedPath?: string;
};

function parseMediaIndex(raw: string): MediaItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is MediaItem => {
      if (!entry || typeof entry !== "object") return false;
      const candidate = entry as Partial<MediaItem>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.fileName === "string" &&
        typeof candidate.mimeType === "string" &&
        typeof candidate.kind === "string"
      );
    });
  } catch {
    return [];
  }
}

function parseFetchResults(raw: string): Map<string, string> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Map();
    const map = new Map<string, string>();
    for (const entry of parsed as FetchResultEntry[]) {
      if (!entry?.id || !entry.storedPath) continue;
      map.set(entry.id, entry.storedPath);
    }
    return map;
  } catch {
    return new Map();
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Restore import zahteva multipart/form-data request sa ZIP fajlom." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const archive = formData.get("file");
    if (!(archive instanceof File)) {
      return NextResponse.json({ error: "Nedostaje ZIP fajl za restore." }, { status: 400 });
    }

    const bytes = await archive.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);
    const mediaIndexFile = zip.file("media/media-index.json");
    if (!mediaIndexFile) {
      return NextResponse.json(
        { error: "media/media-index.json nije pronadjen u backup fajlu." },
        { status: 400 },
      );
    }

    const mediaIndexRaw = await mediaIndexFile.async("text");
    const entries = parseMediaIndex(mediaIndexRaw);
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Backup nema validne media stavke za import." },
        { status: 400 },
      );
    }

    const fetchResultsFile = zip.file("media/fetch-results.json");
    const pathById = fetchResultsFile
      ? parseFetchResults(await fetchResultsFile.async("text"))
      : new Map<string, string>();

    let imported = 0;
    const failed: Array<{ id: string; reason: string }> = [];

    for (const item of entries) {
      try {
        const suggestedPath =
          pathById.get(item.id) ??
          `media/${safeFileName(item.id)}-${safeFileName(item.fileName)}`;
        const zipPath = suggestedPath.startsWith("media/")
          ? suggestedPath
          : `media/${suggestedPath}`;
        const zipEntry = zip.file(zipPath);
        if (!zipEntry) {
          failed.push({ id: item.id, reason: `Nedostaje fajl u arhivi: ${zipPath}` });
          continue;
        }

        const fileBytes = await zipEntry.async("uint8array");
        const blob = await put(
          `media/restored/${Date.now()}-${safeFileName(item.fileName)}`,
          fileBytes,
          {
            access: "public",
            addRandomSuffix: true,
            contentType: item.mimeType,
          },
        );

        await createMediaItem({
          name: item.name,
          fileName: item.fileName,
          mimeType: item.mimeType,
          url: blob.url,
          kind: item.kind as MediaKind,
          categories: Array.isArray(item.categories) ? item.categories : [],
          blobPath: blob.pathname,
          addedAt: item.addedAt ? new Date(item.addedAt) : undefined,
        });
        imported += 1;
      } catch (error) {
        failed.push({
          id: item.id,
          reason: error instanceof Error ? error.message : "Unknown import error",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      imported,
      failedCount: failed.length,
      failed,
    });
  } catch (error) {
    console.error("POST /api/restore/media failed", error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        {
          error: "Media model nije ucitan. Restartuj admin server da povuce novi Prisma client.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Restore media import nije uspeo." }, { status: 500 });
  }
}
