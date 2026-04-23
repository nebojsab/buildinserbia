import { categories } from "../../data/catalog/categories";
import { plannerMappings } from "../../data/catalog/plannerMappings";
import { products } from "../../data/catalog/products";
import type { CatalogCategoryId, CatalogProduct, RecommendedProductsGroup, RecommendedProductsResult } from "../../types/catalog";
import type { Lang } from "../../translations";

const DEFAULT_MAX_GROUPS = 4;
const DEFAULT_MAX_PRODUCTS_PER_GROUP = 3;
const DEFAULT_MAX_RELATED_PRODUCTS = 4;

type RecommendOptions = {
  maxGroups?: number;
  maxProductsPerGroup?: number;
  maxRelatedProducts?: number;
};

function qualityScore(tier: CatalogProduct["qualityTier"]): number {
  if (tier === "mid") return 3;
  if (tier === "higher") return 2;
  if (tier === "lower") return 1;
  return 0;
}

export function getRecommendedProducts(
  selectedTasks: string[],
  lang: Lang,
  options: RecommendOptions = {},
): RecommendedProductsResult {
  const maxGroups = options.maxGroups ?? DEFAULT_MAX_GROUPS;
  const maxProductsPerGroup = options.maxProductsPerGroup ?? DEFAULT_MAX_PRODUCTS_PER_GROUP;
  const maxRelatedProducts = options.maxRelatedProducts ?? DEFAULT_MAX_RELATED_PRODUCTS;
  const selectedSet = new Set(selectedTasks);
  const categoryPriority = new Map<CatalogCategoryId, number>();
  const fallbacks = new Set<CatalogCategoryId>();

  for (const mapping of plannerMappings) {
    if (!selectedSet.has(mapping.taskId)) continue;
    const priority = mapping.priority ?? 50;
    for (const categoryId of mapping.categoryIds) {
      const current = categoryPriority.get(categoryId) ?? 0;
      categoryPriority.set(categoryId, Math.max(current, priority));
    }
    for (const fallback of mapping.fallbackCategoryIds ?? []) {
      fallbacks.add(fallback);
    }
  }

  const mappedCategories = new Set(categoryPriority.keys());
  let matched = products.filter(
    (product) => product.isActive && mappedCategories.has(product.category),
  );

  // If no direct matches, use featured products from fallback categories.
  if (matched.length === 0 && fallbacks.size > 0) {
    matched = products.filter(
      (product) => product.isActive && product.isFeatured && fallbacks.has(product.category),
    );
  }

  const scored = matched
    .map((product) => {
      const categoryBoost = categoryPriority.get(product.category) ?? 0;
      const taskBoost = product.plannerMappings.some((task) => selectedSet.has(task)) ? 25 : 0;
      const featuredBoost = product.isFeatured ? 40 : 0;
      const score = categoryBoost + taskBoost + featuredBoost + qualityScore(product.qualityTier);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title));

  const groupedMap = new Map<CatalogCategoryId, CatalogProduct[]>();
  for (const { product } of scored) {
    const existing = groupedMap.get(product.category) ?? [];
    if (existing.some((entry) => entry.id === product.id)) continue;
    if (existing.length >= maxProductsPerGroup) continue;
    existing.push(product);
    groupedMap.set(product.category, existing);
  }

  const categoryOrder = [...groupedMap.keys()].sort((a, b) => {
    const pa = categoryPriority.get(a) ?? 0;
    const pb = categoryPriority.get(b) ?? 0;
    if (pa !== pb) return pb - pa;
    const ca = categories.find((c) => c.id === a)?.sortOrder ?? 999;
    const cb = categories.find((c) => c.id === b)?.sortOrder ?? 999;
    return ca - cb;
  });

  const groups: RecommendedProductsGroup[] = categoryOrder.slice(0, maxGroups).map((categoryId) => {
    const category = categories.find((entry) => entry.id === categoryId);
    return {
      categoryId,
      categoryTitle: category?.title[lang] ?? categoryId,
      products: groupedMap.get(categoryId) ?? [],
    };
  });

  let relatedProducts: CatalogProduct[] = [];
  if (groups.length === 0) {
    relatedProducts = products
      .filter((product) => product.isActive && product.isFeatured)
      .slice(0, maxRelatedProducts);
  } else if (groups.reduce((sum, group) => sum + group.products.length, 0) < 4) {
    const usedIds = new Set(groups.flatMap((group) => group.products.map((product) => product.id)));
    relatedProducts = products
      .filter((product) => product.isActive && !usedIds.has(product.id))
      .slice(0, maxRelatedProducts);
  }

  return {
    groups,
    relatedProducts,
    empty: groups.length === 0 && relatedProducts.length === 0,
  };
}
