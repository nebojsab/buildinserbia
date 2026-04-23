import type { Lang } from "../translations";

export type CatalogSourceType = "manual";
export type QualityTier = "lower" | "mid" | "higher";
export type CurrencyCode = "EUR" | "RSD";

export type CatalogCategoryId =
  | "windows"
  | "shutters"
  | "mosquito_nets"
  | "shower_cabins"
  | "tiles"
  | "faucets"
  | "sinks"
  | "toilets"
  | "bathroom_furniture"
  | "kitchen_elements"
  | "kitchen_sinks"
  | "kitchen_faucets"
  | "lighting"
  | "outdoor_lighting"
  | "fences"
  | "gates"
  | "gate_motors"
  | "paving"
  | "irrigation"
  | "lawn";

export type LocalizedCatalogText = Record<Lang, string>;

export interface CatalogCategory {
  id: CatalogCategoryId;
  title: LocalizedCatalogText;
  description?: LocalizedCatalogText;
  sortOrder?: number;
  isActive: boolean;
}

export interface CatalogProduct {
  id: string;
  title: string;
  category: CatalogCategoryId;
  subcategory?: string;
  shortDescription: string;
  imageUrl: string;
  merchantName: string;
  merchantUrl: string;
  productUrl: string;
  affiliateUrl?: string;
  price?: number;
  currency?: CurrencyCode;
  priceLabel?: string;
  qualityTier?: QualityTier;
  tags: string[];
  plannerMappings: string[];
  lastCheckedAt: string;
  isFeatured: boolean;
  isActive: boolean;
  sourceType: CatalogSourceType;
}

export interface PlannerCatalogMapping {
  taskId: string;
  categoryIds: CatalogCategoryId[];
  priority?: number;
  fallbackCategoryIds?: CatalogCategoryId[];
}

export interface RecommendedProductsGroup {
  categoryId: CatalogCategoryId;
  categoryTitle: string;
  products: CatalogProduct[];
}

export interface RecommendedProductsResult {
  groups: RecommendedProductsGroup[];
  relatedProducts: CatalogProduct[];
  empty: boolean;
}
