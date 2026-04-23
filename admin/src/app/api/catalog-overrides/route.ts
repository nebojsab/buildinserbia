import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exportCatalogOverridesJson } from "@/lib/catalogAdminState";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAuth();
  const payload = await exportCatalogOverridesJson();
  const fileName = `catalog-overrides-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(payload, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "no-store",
    },
  });
}
