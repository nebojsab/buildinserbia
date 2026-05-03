import { NextResponse } from "next/server";
import { products as baseProducts } from "@shared/data/catalog/products";
import { categories } from "@shared/data/catalog/categories";
import { getCatalogAdminState } from "@/lib/catalogAdminState";
import { getCatalogCategoryIds } from "@/planner/wizard/wizardCatalogMapping";
import type { CatalogProduct } from "@shared/types/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_GROUP = 4;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const catsParam = searchParams.get("cats") ?? "";
  const lang = (searchParams.get("lang") ?? "sr") as "sr" | "en" | "ru";

  const wizardCats = catsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (wizardCats.length === 0) {
    return NextResponse.json({ groups: [] });
  }

  const catalogCatIds = getCatalogCategoryIds(wizardCats);
  if (catalogCatIds.length === 0) {
    return NextResponse.json({ groups: [] });
  }

  // Merge base products with admin overrides
  const adminState = await getCatalogAdminState();
  const allProducts: CatalogProduct[] = [
    ...baseProducts,
    ...adminState.customProducts,
  ].map((p) => {
    const override = adminState.productOverrides[p.id];
    if (!override) return p;
    return { ...p, ...override };
  }).filter((p) => p.isActive && !(p as CatalogProduct & { isDeleted?: boolean }).isDeleted);

  // Build groups in the order of catalogCatIds
  const groups = catalogCatIds.flatMap((catId) => {
    const catMeta = categories.find((c) => c.id === catId);
    if (!catMeta?.isActive) return [];

    const matching = allProducts
      .filter((p) => p.category === catId)
      .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
      .slice(0, MAX_PER_GROUP)
      .map((p) => ({
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        imageUrl: p.imageUrl,
        merchantName: p.merchantName,
        productUrl: p.productUrl,
        priceLabel: p.priceLabel,
        qualityTier: p.qualityTier,
        isFeatured: p.isFeatured,
      }));

    if (matching.length === 0) return [];

    const titleRaw = catMeta.title as Record<string, string>;
    const title = titleRaw[lang] ?? titleRaw["sr"] ?? catId;

    return [{ categoryId: catId, categoryTitle: title, products: matching }];
  });

  return NextResponse.json(
    { groups },
    { headers: { "cache-control": "no-store" } }
  );
}
