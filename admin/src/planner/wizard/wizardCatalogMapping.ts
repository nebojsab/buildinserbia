import type { CatalogCategoryId } from "@shared/types/catalog";

// Maps wizard category IDs → catalog category IDs
// Order matters: determines group display order in recommendations
export const wizardToCatalogCategories: Record<string, CatalogCategoryId[]> = {
  kupatilo:               ["shower_cabins", "faucets", "toilets", "sinks", "bathroom_furniture", "tiles"],
  podovi:                 ["tiles"],
  zidovi_plafoni:         ["tiles"],
  prozori_vrata:          ["windows", "shutters", "mosquito_nets"],
  elektrika:              ["lighting"],
  vodovodne_instalacije:  ["faucets", "sinks"],
  grejanje:               [],
  kuhinja:                ["kitchen_elements", "kitchen_sinks", "kitchen_faucets", "tiles"],
  fasada_izolacija:       [],
  krov:                   [],
};

export function getCatalogCategoryIds(wizardCategoryIds: string[]): CatalogCategoryId[] {
  const seen = new Set<CatalogCategoryId>();
  const result: CatalogCategoryId[] = [];
  for (const wid of wizardCategoryIds) {
    for (const cid of wizardToCatalogCategories[wid] ?? []) {
      if (!seen.has(cid)) { seen.add(cid); result.push(cid); }
    }
  }
  return result;
}
