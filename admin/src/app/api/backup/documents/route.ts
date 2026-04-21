import JSZip from "jszip";
import { zipToDownloadResponse } from "@/lib/backupZip";
import { getServerContentByType } from "@/lib/contentStoreServer";

export const runtime = "nodejs";

export async function GET() {
  const generatedAt = new Date().toISOString();
  const documents = await getServerContentByType("document");

  const zip = new JSZip();
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        formatVersion: 1,
        backupType: "documents",
        generatedAt,
        counts: {
          documents: documents.length,
        },
      },
      null,
      2,
    ),
  );
  zip.file("content/documents.json", JSON.stringify(documents, null, 2));

  return zipToDownloadResponse(zip, `buildinserbia-documents-backup-${generatedAt.slice(0, 10)}.zip`);
}
