import JSZip from "jszip";
import { zipToDownloadResponse } from "@/lib/backupZip";
import { getCatalogAdminState } from "@/lib/catalogAdminState";

export const runtime = "nodejs";

export async function GET() {
  const generatedAt = new Date().toISOString();
  const state = await getCatalogAdminState();

  const zip = new JSZip();
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        formatVersion: 1,
        backupType: "catalog",
        generatedAt,
        counts: {
          customProducts: state.customProducts.length,
          productOverrides: Object.keys(state.productOverrides).length,
        },
      },
      null,
      2,
    ),
  );
  zip.file("catalog-admin-state.json", JSON.stringify(state, null, 2));

  return zipToDownloadResponse(zip, `buildinserbia-catalog-backup-${generatedAt.slice(0, 10)}.zip`);
}
