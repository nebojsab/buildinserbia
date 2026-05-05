import type { CatalogCategoryId } from "@shared/types/catalog";

// Maps wizard category IDs → catalog category IDs
// Order matters: determines group display order in recommendations
export const wizardToCatalogCategories: Record<string, CatalogCategoryId[]> = {
  // ── Renovacija (legacy IDs) ───────────────────────────────────────────────
  kupatilo:               ["shower_cabins", "faucets", "toilets", "sinks", "bathroom_furniture", "tiles"],
  podovi:                 ["tiles"],
  zidovi_plafoni:         ["tiles"],
  prozori_vrata:          ["windows", "shutters", "mosquito_nets", "interior_doors", "entrance_doors", "terrace_doors"],
  elektrika:              ["lighting"],
  vodovodne_instalacije:  ["faucets", "sinks"],
  grejanje:               [],
  kuhinja:                ["kitchen_elements", "kitchen_sinks", "kitchen_faucets", "tiles"],
  fasada_izolacija:       [],
  krov:                   [],

  // ── Izgradnja / Dogradnja category IDs ───────────────────────────────────
  projektna_dok:          [],
  temelji_iskop:          [],
  temelji:                [],
  konstrukcija:           [],
  spoljna_stolarija:      ["windows", "shutters", "mosquito_nets", "entrance_doors", "terrace_doors", "garage_doors"],
  stolarija:              ["windows", "shutters", "mosquito_nets", "entrance_doors", "terrace_doors", "garage_doors"],
  elektroinstalacije:     ["lighting"],
  vik_instalacije:        ["faucets", "sinks"],
  grejanje_hladjenje:     [],
  unutrasnje_zavrse:      ["tiles", "interior_doors"],
  zavrse_radovi:          ["tiles", "interior_doors"],
  instalacije:            ["faucets", "sinks"],
  fasada:                 [],

  // ── Dvorište category IDs ─────────────────────────────────────────────────
  priprema_terena:        [],
  staze_terase:           ["paving"],
  zelene_povrsine:        ["lawn"],
  ograde_kapije:          ["fences", "gates", "gate_motors"],
  navodnjavanje:          ["irrigation"],
  rasveta:                ["outdoor_lighting"],
  pergola_mobilijar:      [],
  dvorisni_objekat:       [],
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
