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
  | "lawn"
  | "interior_doors"
  | "entrance_doors"
  | "terrace_doors"
  | "garage_doors"
  | "power_tools"
  // ── Keramika i podne obloge ───────────────────────────────────────────────
  | "tile_adhesives"
  | "granite_tiles"
  | "marble_tiles"
  | "floor_trims"
  | "tile_tools"
  | "parquet"
  | "laminate"
  | "vinyl_flooring"
  // ── Boje, malteri i fasada ────────────────────────────────────────────────
  | "paints"
  | "primers"
  | "decorative_plaster"
  | "etics_systems"
  // ── Građevinski materijali ────────────────────────────────────────────────
  | "masonry_blocks"
  | "cement_mortar"
  | "reinforcement"
  | "drywall"
  | "drywall_profiles"
  // ── Drvo, ploče i nosači ──────────────────────────────────────────────────
  | "timber_lumber"
  | "osb_boards"
  | "panel_boards"
  // ── Krov ─────────────────────────────────────────────────────────────────
  | "roofing_tiles"
  | "roof_membranes"
  | "gutters"
  // ── Izolacija i hidroizolacija ────────────────────────────────────────────
  | "insulation_thermal"
  | "insulation_acoustic"
  | "waterproofing"
  // ── Hemija i lepkovi ──────────────────────────────────────────────────────
  | "adhesives_sealants"
  | "construction_chemicals"
  // ── ViK instalacije ───────────────────────────────────────────────────────
  | "pipes_fittings"
  | "water_heaters"
  | "septic_tanks"
  | "valves"
  | "pumps"
  // ── Sanitarije ────────────────────────────────────────────────────────────
  | "bidets"
  | "bathtubs"
  | "mirrors"
  | "towel_radiators"
  | "bathroom_accessories"
  // ── Grejanje i klima ──────────────────────────────────────────────────────
  | "boilers_heating"
  | "radiators"
  | "underfloor_heating"
  | "air_conditioning"
  | "heat_pumps"
  | "ventilation"
  // ── Elektro ───────────────────────────────────────────────────────────────
  | "electrical_cables"
  | "electrical_panels"
  | "switches_outlets"
  | "smart_home"
  // ── Alati ─────────────────────────────────────────────────────────────────
  | "hand_tools"
  | "measuring_tools"
  | "safety_equipment";

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
