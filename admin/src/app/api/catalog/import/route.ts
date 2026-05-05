import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
]);
const VALID_TIERS = new Set<string>(["lower", "mid", "higher"]);

function isUrl(s: string) {
  try { return ["http:", "https:"].includes(new URL(s).protocol); }
  catch { return false; }
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  // Parse header — handle optional BOM
  const headerLine = lines[0].replace(/^﻿/, "");
  const headers = splitCsvRow(headerLine);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] ?? "").trim(); });
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
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

type ImportResult = {
  imported: number;
  skipped: { row: number; reason: string }[];
};

export async function POST(req: Request): Promise<NextResponse> {
  let text: string;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    text = await (file as Blob).text();
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 400 });
  }

  const rows = parseCsv(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 });
  }

  // Build a set of all existing productUrls (base + custom) to prevent overwriting or duplicating
  const adminState = await getCatalogAdminState();
  const existingUrls = new Set<string>([
    ...baseProducts.map((p) => p.productUrl),
    ...adminState.customProducts.map((p) => p.productUrl),
  ]);

  const result: ImportResult = { imported: 0, skipped: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-based, +1 for header

    const title = row["title"]?.trim() ?? "";
    const category = row["category"]?.trim() ?? "";
    const shortDescription = row["short_description"]?.trim() ?? "";
    const merchantName = row["merchant_name"]?.trim() ?? "";
    const productUrl = row["product_url"]?.trim() ?? "";
    const imageUrl = row["image_url"]?.trim() ?? "";
    const priceLabel = row["price_label"]?.trim() ?? "";
    const qualityTierRaw = row["quality_tier"]?.trim() ?? "mid";
    const isFeaturedRaw = row["is_featured"]?.trim().toLowerCase() ?? "";

    // Validate required fields
    if (!title) { result.skipped.push({ row: rowNum, reason: "Missing: title" }); continue; }
    if (!VALID_CATEGORIES.has(category)) {
      result.skipped.push({ row: rowNum, reason: `Invalid category: "${category}"` }); continue;
    }
    if (!shortDescription) { result.skipped.push({ row: rowNum, reason: "Missing: short_description" }); continue; }
    if (!merchantName) { result.skipped.push({ row: rowNum, reason: "Missing: merchant_name" }); continue; }
    if (!isUrl(productUrl)) { result.skipped.push({ row: rowNum, reason: `Invalid product_url: "${productUrl}"` }); continue; }
    if (!isUrl(imageUrl)) { result.skipped.push({ row: rowNum, reason: `Invalid image_url: "${imageUrl}"` }); continue; }
    if (existingUrls.has(productUrl)) { result.skipped.push({ row: rowNum, reason: `Already exists: "${productUrl}"` }); continue; }

    const qualityTier: QualityTier = VALID_TIERS.has(qualityTierRaw)
      ? (qualityTierRaw as QualityTier)
      : "mid";
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
    existingUrls.add(productUrl); // guard against duplicates within the same CSV
    result.imported++;
  }

  revalidatePath("/admin/catalog");
  return NextResponse.json(result);
}
