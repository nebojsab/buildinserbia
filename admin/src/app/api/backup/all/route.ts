import JSZip from "jszip";
import { isMediaStoreUnavailableError, listMediaItems } from "@/lib/mediaLibraryServer";
import { safeFileName, zipToDownloadResponse } from "@/lib/backupZip";
import { getServerContentByType } from "@/lib/contentStoreServer";

export const runtime = "nodejs";

export async function GET() {
  try {
    const generatedAt = new Date().toISOString();
    const [documents, blogPosts, mediaItems] = await Promise.all([
      getServerContentByType("document"),
      getServerContentByType("blog"),
      listMediaItems(),
    ]);

    const zip = new JSZip();
    const mediaFolder = zip.folder("media");
    const mediaFetchResults: Array<{ id: string; fileName: string; storedPath?: string; error?: string }> = [];

    if (mediaFolder) {
      for (const item of mediaItems) {
        try {
          const response = await fetch(item.url);
          if (!response.ok) {
            mediaFetchResults.push({
              id: item.id,
              fileName: item.fileName,
              error: `HTTP ${response.status}`,
            });
            continue;
          }
          const bytes = await response.arrayBuffer();
          const archivePath = `${safeFileName(item.id)}-${safeFileName(item.fileName)}`;
          mediaFolder.file(archivePath, bytes);
          mediaFetchResults.push({
            id: item.id,
            fileName: item.fileName,
            storedPath: `media/${archivePath}`,
          });
        } catch (error) {
          mediaFetchResults.push({
            id: item.id,
            fileName: item.fileName,
            error: error instanceof Error ? error.message : "Unknown fetch error",
          });
        }
      }
    }

    zip.file(
      "manifest.json",
      JSON.stringify(
        {
          formatVersion: 1,
          backupType: "all",
          generatedAt,
          counts: {
            documents: documents.length,
            blogPosts: blogPosts.length,
            mediaItems: mediaItems.length,
            mediaFilesPacked: mediaFetchResults.filter((entry) => !entry.error).length,
            mediaFilesFailed: mediaFetchResults.filter((entry) => Boolean(entry.error)).length,
          },
        },
        null,
        2,
      ),
    );

    zip.file("content/documents.json", JSON.stringify(documents, null, 2));
    zip.file("content/blog-posts.json", JSON.stringify(blogPosts, null, 2));
    zip.file("media/media-index.json", JSON.stringify(mediaItems, null, 2));
    zip.file("media/fetch-results.json", JSON.stringify(mediaFetchResults, null, 2));

    return zipToDownloadResponse(zip, `buildinserbia-full-backup-${generatedAt.slice(0, 10)}.zip`);
  } catch (error) {
    console.error("GET /api/backup/all failed", error);
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
    return new Response(JSON.stringify({ error: "Full backup nije uspeo." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
