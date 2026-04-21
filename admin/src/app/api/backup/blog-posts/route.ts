import JSZip from "jszip";
import { zipToDownloadResponse } from "@/lib/backupZip";
import { getServerContentByType } from "@/lib/contentStoreServer";

export const runtime = "nodejs";

export async function GET() {
  const generatedAt = new Date().toISOString();
  const posts = await getServerContentByType("blog");

  const zip = new JSZip();
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        formatVersion: 1,
        backupType: "blog-posts",
        generatedAt,
        counts: {
          posts: posts.length,
        },
      },
      null,
      2,
    ),
  );
  zip.file("content/blog-posts.json", JSON.stringify(posts, null, 2));

  return zipToDownloadResponse(zip, `buildinserbia-blog-backup-${generatedAt.slice(0, 10)}.zip`);
}
