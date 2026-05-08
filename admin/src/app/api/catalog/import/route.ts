import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { bulkAddCustomCatalogProducts, getCatalogAdminState, updateCatalogProductOverride, updateCustomCatalogProduct } from "@/lib/catalogAdminState";
import { products as baseProducts } from "@shared/data/catalog/products";
import type { CatalogProduct, CatalogCategoryId, QualityTier } from "@shared/types/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set<string>([
  // Stolarija
  "windows", "shutters", "mosquito_nets",
  "interior_doors", "entrance_doors", "terrace_doors", "garage_doors",
  // Kupatilo i sanitarije
  "shower_cabins", "toilets", "sinks", "faucets", "bathroom_furniture",
  "bidets", "bathtubs", "mirrors", "towel_radiators", "bathroom_accessories",
  // Kuhinja
  "kitchen_elements", "kitchen_sinks", "kitchen_faucets",
  // Keramika i podne obloge
  "tiles", "granite_tiles", "marble_tiles", "tile_adhesives", "tile_tools",
  "floor_trims", "parquet", "laminate", "vinyl_flooring",
  // Boje i fasada
  "paints", "primers", "decorative_plaster", "etics_systems",
  // Građevinski materijali
  "masonry_blocks", "cement_mortar", "reinforcement", "drywall", "drywall_profiles",
  // Drvo i ploče
  "timber_lumber", "osb_boards", "panel_boards",
  // Krov
  "roofing_tiles", "roof_membranes", "gutters",
  // Izolacija
  "insulation_thermal", "insulation_acoustic", "waterproofing",
  // Hemija
  "adhesives_sealants", "construction_chemicals",
  // ViK
  "pipes_fittings", "water_heaters", "septic_tanks", "valves", "pumps",
  // Grejanje i klima
  "boilers_heating", "radiators", "underfloor_heating", "air_conditioning",
  "heat_pumps", "ventilation",
  // Elektro
  "electrical_cables", "electrical_panels", "switches_outlets", "smart_home",
  // Alati
  "power_tools", "hand_tools", "measuring_tools", "safety_equipment",
  // Rasveta i dvorište
  "lighting", "outdoor_lighting",
  "fences", "gates", "gate_motors", "paving", "irrigation", "lawn",
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
  const arrayBuf = await blob.arrayBuffer();
  const wb = XLSX.read(arrayBuf, { type: "array" });

  // Use first non-hidden sheet (skip our _categories / _tiers helper sheets)
  const sheetName = wb.SheetNames.find((n) => !n.startsWith("_"));
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];

  // sheet_to_json returns rows as objects keyed by header; defval ensures no undefined
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  return raw
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        normalized[normalizeHeader(String(k))] = String(v ?? "").trim();
      }
      return normalized;
    })
    .filter((row) => {
      // Skip legend/comment rows (empty title or starts with *)
      const title = row["title"] ?? "";
      return title !== "" && !title.startsWith("*");
    });
}

type ImportResult = {
  imported: number;
  updated: number;
  skipped: { row: number; reason: string }[];
};

export async function POST(req: Request): Promise<NextResponse> {
  let rows: Record<string, string>[];
  let parseMode = "unknown";
  let upsertMode = false;
  try {
    const form = await req.formData();
    const file = form.get("file");
    upsertMode = form.get("mode") === "upsert";
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

  const adminState = await getCatalogAdminState();

  // Deduplication is title-based, not URL-based — multiple products can
  // legitimately share the same product URL (e.g. a merchant category page).
  const existingTitles = new Set<string>([
    ...baseProducts.map((p) => p.title.toLowerCase()),
    ...adminState.customProducts.map((p) => p.title.toLowerCase()),
  ]);

  const result: ImportResult = { imported: 0, updated: 0, skipped: [] };
  const toAdd: CatalogProduct[] = [];
  const now = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const title            = row["title"]             ?? "";
    const category         = row["category"]          ?? "";
    const shortDescription = row["short_description"] ?? "";
    const merchantName     = row["merchant_name"]     ?? "";
    const productUrl       = row["product_url"]       ?? "";
    const imageUrl         = row["image_url"]         ?? "";
    const priceLabel       = row["price_label"]       ?? "";
    const qualityTierRaw   = row["quality_tier"]      || "mid";
    const isFeaturedRaw    = (row["is_featured"] ?? "").toLowerCase();

    if (!title)                          { result.skipped.push({ row: rowNum, reason: "Missing: title" }); continue; }
    if (!VALID_CATEGORIES.has(category)) { result.skipped.push({ row: rowNum, reason: `Invalid category: "${category}"` }); continue; }
    if (!shortDescription)               { result.skipped.push({ row: rowNum, reason: "Missing: short_description" }); continue; }
    if (!merchantName)                   { result.skipped.push({ row: rowNum, reason: "Missing: merchant_name" }); continue; }
    if (!isUrl(productUrl))              { result.skipped.push({ row: rowNum, reason: `Invalid product_url: "${productUrl}"` }); continue; }
    if (!isUrl(imageUrl))                { result.skipped.push({ row: rowNum, reason: `Invalid image_url: "${imageUrl}"` }); continue; }

    const titleKey = title.toLowerCase();
    if (existingTitles.has(titleKey)) {
      if (!upsertMode) {
        result.skipped.push({ row: rowNum, reason: `Već postoji proizvod sa nazivom: "${title}"` });
        continue;
      }
      // Upsert: find existing product by title and update its fields
      const customProduct = adminState.customProducts.find((p) => p.title.toLowerCase() === titleKey);
      if (customProduct) {
        await updateCustomCatalogProduct(customProduct.id, { title, merchantName, productUrl, imageUrl, priceLabel: priceLabel || undefined });
      } else {
        const baseProduct = baseProducts.find((p) => p.title.toLowerCase() === titleKey);
        if (baseProduct) {
          await updateCatalogProductOverride(baseProduct.id, { title, merchantName, productUrl, imageUrl, priceLabel: priceLabel || undefined });
        }
      }
      result.updated++;
      continue;
    }

    const qualityTier: QualityTier = VALID_TIERS.has(qualityTierRaw) ? (qualityTierRaw as QualityTier) : "mid";
    const isFeatured = isFeaturedRaw === "true" || isFeaturedRaw === "1" || isFeaturedRaw === "yes";

    toAdd.push({
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
      lastCheckedAt: now,
      isFeatured,
      isActive: true,
      sourceType: "manual",
    });

    existingTitles.add(titleKey);
    result.imported++;
  }

  // Single bulk write for new products
  if (toAdd.length > 0) {
    await bulkAddCustomCatalogProducts(toAdd);
  }

  revalidatePath("/admin/catalog");
  return NextResponse.json(result);
}
