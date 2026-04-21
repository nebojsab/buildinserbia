import JSZip from "jszip";
import { isMediaStoreUnavailableError, listMediaItems } from "@/lib/mediaLibraryServer";
import { safeFileName, zipToDownloadResponse } from "@/lib/backupZip";

export const runtime = "nodejs";

type MediaFetchResult = {
  id: string;
  fileName: string;
  storedPath?: string;
  error?: string;
};

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    const items = await listMediaItems();
    const zip = new JSZip();
    const mediaFolder = zip.folder("media");
    const fileResults: MediaFetchResult[] = [];

    if (!mediaFolder) {
      return new Response(JSON.stringify({ error: "Ne mogu da pripremim media backup." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const item of items) {
      try {
        const response = await fetch(item.url);
        if (!response.ok) {
          fileResults.push({
            id: item.id,
            fileName: item.fileName,
            error: `HTTP ${response.status}`,
          });
          continue;
        }
        const bytes = await response.arrayBuffer();
        const archivePath = `${safeFileName(item.id)}-${safeFileName(item.fileName)}`;
        mediaFolder.file(archivePath, bytes);
        fileResults.push({
          id: item.id,
          fileName: item.fileName,
          storedPath: `media/${archivePath}`,
        });
      } catch (error) {
        fileResults.push({
          id: item.id,
          fileName: item.fileName,
          error: error instanceof Error ? error.message : "Unknown fetch error",
        });
      }
    }

    zip.file(
      "manifest.json",
      JSON.stringify(
        {
          formatVersion: 1,
          backupType: "media",
          generatedAt,
          counts: {
            items: items.length,
            filesPacked: fileResults.filter((entry) => !entry.error).length,
            filesFailed: fileResults.filter((entry) => Boolean(entry.error)).length,
          },
        },
        null,
        2,
      ),
    );
    zip.file("media/media-index.json", JSON.stringify(items, null, 2));
    zip.file("media/fetch-results.json", JSON.stringify(fileResults, null, 2));

    return zipToDownloadResponse(zip, `buildinserbia-media-backup-${generatedAt.slice(0, 10)}.zip`);
  } catch (error) {
    console.error("GET /api/backup/media failed", error);
    if (isMediaStoreUnavailableError(error)) {
      return new Response(
        JSON.stringify({
          error: "Media model nije ucitan. Restartuj admin server da povuce novi Prisma client.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return new Response(JSON.stringify({ error: "Media backup nije uspeo." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
