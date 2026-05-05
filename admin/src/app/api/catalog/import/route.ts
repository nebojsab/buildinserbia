import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";
import { addCustomCatalogProduct, getCatalogAdminState } from "@/lib/catalogAdminState";
import { products as baseProducts } from "@shared/data/catalog/products";
import type { CatalogProduct, CatalogCategoryId, QualityTier } from "@shared/types/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set<string>([
  "windows", "shutters", "mosquito_nets", "shower_cabins", "tiles", "faucets",
  "sinks", "toilets", "bathroom_furniture", "kitchen_elements", "kitchen_sinks",
  "kitchen_faucets", "lighting", "outdoor_lighting", "fences", "gates",
  "gate_motors", "paving", "irrigation", "lawn",
  "interior_doors", "entrance_doors", "terrace_doors", "garage_doors", "power_tools",
]);
const VALID_TIERS = new Set<string>(["lower", "mid", "higher"]);

function isUrl(s: string) {
  try { return ["http:", "https:"].includes(new URL(s).protocol); }
  catch { return false; }
}

// Strip asterisk + trim so headers from the xlsx template ("title *") match field keys
function normalizeHeader(h: string): string {
  return h.replace(/\s*\*\s*$/, "").trim();
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];
  const headerLine = lines[0].replace(/^﻿/, "");
  const headers = splitCsvRow(headerLine).map(normalizeHeader);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;
    const values = splitCsvRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? "").trim(); });
    rows.push(row);
  }
  return rows;
}

function splitCsvRow(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

async function parseXlsx(blob: Blob): Promise<Record<string, string>[]> {
  const nodeBuf = Buffer.from(new Uint8Array(await blob.arrayBuffer()));
  const wb = new ExcelJS.Workbook();
  // ExcelJS types lag behind Node.js Buffer generics — cast needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await wb.xlsx.load(nodeBuf as any);
  const ws = wb.worksheets.find((s) => !s.name.startsWith("_"));
  if (!ws) return [];

  const rows: Record<string, string>[] = [];
  let headers: string[] = [];

  ws.eachRow((row, rowNum) => {
    const values = (row.values as (ExcelJS.CellValue | undefined)[]).slice(1); // col index starts at 1
    const strValues = values.map((v) => (v == null ? "" : String(v).trim()));

    if (rowNum === 1) {
      headers = strValues.map(normalizeHeader);
      return;
    }
    // Skip legend/comment rows (empty title or starts with *)
    if (!strValues[0] || strValues[0].startsWith("*")) return;
    const row2: Record<string, string> = {};
    headers.forEach((h, idx) => { row2[h] = strValues[idx] ?? ""; });
    rows.push(row2);
  });

  return rows;
}

type ImportResult = {
  imported: number;
  skipped: { row: number; reason: string }[];
};

export async function POST(req: Request): Promise<NextResponse> {
  let rows: Record<string, string>[];
  let parseMode = "unknown";
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const blob = file as Blob;
    const fileName = (blob as File).name ?? "";
    const isXlsx = fileName.toLowerCase().endsWith(".xlsx") || blob.type.includes("spreadsheet");
    parseMode = isXlsx ? "xlsx" : "csv";

    if (isXlsx) {
      try {
        rows = await parseXlsx(blob);
      } catch (xlsxErr) {
        const msg = xlsxErr instanceof Error ? xlsxErr.message : String(xlsxErr);
        return NextResponse.json({ error: `Failed to parse xlsx: ${msg}` }, { status: 400 });
      }
    } else {
      rows = parseCsv(await blob.text());
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to read file (${parseMode}): ${msg}` }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: `No data rows found (parsed as ${parseMode}). Check that the file has data below the header row and is not all example/comment rows.` }, { status: 400 });
  }

  // Build set of all existing productUrls to prevent duplicates / overwriting
  const adminState = await getCatalogAdminState();
  const existingUrls = new Set<string>([
    ...baseProducts.map((p) => p.productUrl),
    ...adminState.customProducts.map((p) => p.productUrl),
  ]);

  const result: ImportResult = { imported: 0, skipped: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const title           = row["title"]             ?? "";
    const category        = row["category"]          ?? "";
    const shortDescription = row["short_description"] ?? "";
    const merchantName    = row["merchant_name"]      ?? "";
    const productUrl      = row["product_url"]        ?? "";
    const imageUrl        = row["image_url"]          ?? "";
    const priceLabel      = row["price_label"]        ?? "";
    const qualityTierRaw  = row["quality_tier"]       || "mid";
    const isFeaturedRaw   = (row["is_featured"] ?? "").toLowerCase();

    if (!title)                          { result.skipped.push({ row: rowNum, reason: "Missing: title" }); continue; }
    if (!VALID_CATEGORIES.has(category)) { result.skipped.push({ row: rowNum, reason: `Invalid category: "${category}"` }); continue; }
    if (!shortDescription)               { result.skipped.push({ row: rowNum, reason: "Missing: short_description" }); continue; }
    if (!merchantName)                   { result.skipped.push({ row: rowNum, reason: "Missing: merchant_name" }); continue; }
    if (!isUrl(productUrl))              { result.skipped.push({ row: rowNum, reason: `Invalid product_url: "${productUrl}"` }); continue; }
    if (!isUrl(imageUrl))                { result.skipped.push({ row: rowNum, reason: `Invalid image_url: "${imageUrl}"` }); continue; }
    if (existingUrls.has(productUrl))    { result.skipped.push({ row: rowNum, reason: `Already exists: "${productUrl}"` }); continue; }

    const qualityTier: QualityTier = VALID_TIERS.has(qualityTierRaw) ? (qualityTierRaw as QualityTier) : "mid";
    const isFeatured = isFeaturedRaw === "true" || isFeaturedRaw === "1" || isFeaturedRaw === "yes";

    const product: CatalogProduct = {
      id: `custom_${Date.now()}_${i}`,
      title,
      category: category as CatalogCategoryId,
      shortDescription,
      imageUrl,
      merchantName,
      merchantUrl: productUrl,
      productUrl,
      priceLabel: priceLabel || undefined,
      qualityTier,
      tags: ["csv-import"],
      plannerMappings: [],
      lastCheckedAt: new Date().toISOString().slice(0, 10),
      isFeatured,
      isActive: true,
      sourceType: "manual",
    };

    await addCustomCatalogProduct(product);
    existingUrls.add(productUrl);
    result.imported++;
  }

  revalidatePath("/admin/catalog");
  return NextResponse.json(result);
}
