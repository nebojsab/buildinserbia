import type { CatalogCategoryId } from "@shared/types/catalog";

// Maps wizard category IDs → catalog category IDs
// Order matters: determines group display order in recommendations
export const wizardToCatalogCategories: Record<string, CatalogCategoryId[]> = {
  // ── Renovacija (legacy IDs) ───────────────────────────────────────────────
  kupatilo:               ["shower_cabins", "faucets", "toilets", "sinks", "bathroom_furniture", "bidets", "bathtubs", "mirrors", "towel_radiators", "bathroom_accessories", "tiles"],
  podovi:                 ["tiles", "granite_tiles", "marble_tiles", "parquet", "laminate", "vinyl_flooring", "tile_adhesives", "floor_trims"],
  zidovi_plafoni:         ["tiles", "paints", "decorative_plaster", "primers", "drywall", "drywall_profiles"],
  prozori_vrata:          ["windows", "shutters", "mosquito_nets", "interior_doors", "entrance_doors", "terrace_doors"],
  elektrika:              ["lighting", "electrical_cables", "electrical_panels", "switches_outlets", "smart_home"],
  vodovodne_instalacije:  ["faucets", "sinks", "pipes_fittings", "valves", "water_heaters", "pumps"],
  grejanje:               ["boilers_heating", "radiators", "underfloor_heating", "air_conditioning", "heat_pumps", "ventilation"],
  kuhinja:                ["kitchen_elements", "kitchen_sinks", "kitchen_faucets", "tiles", "tile_adhesives"],
  fasada_izolacija:       ["etics_systems", "insulation_thermal", "insulation_acoustic", "waterproofing", "paints", "primers", "decorative_plaster"],
  krov:                   ["roofing_tiles", "roof_membranes", "gutters", "insulation_thermal", "waterproofing"],

  // ── Izgradnja / Dogradnja category IDs ───────────────────────────────────
  projektna_dok:          [],
  temelji_iskop:          ["cement_mortar", "reinforcement", "waterproofing", "construction_chemicals"],
  temelji:                ["cement_mortar", "reinforcement", "waterproofing"],
  konstrukcija:           ["masonry_blocks", "cement_mortar", "reinforcement", "timber_lumber", "osb_boards", "drywall", "drywall_profiles", "adhesives_sealants"],
  spoljna_stolarija:      ["windows", "shutters", "mosquito_nets", "entrance_doors", "terrace_doors", "garage_doors"],
  stolarija:              ["windows", "shutters", "mosquito_nets", "entrance_doors", "terrace_doors", "garage_doors"],
  elektroinstalacije:     ["lighting", "electrical_cables", "electrical_panels", "switches_outlets", "smart_home"],
  vik_instalacije:        ["faucets", "sinks", "pipes_fittings", "valves", "water_heaters", "septic_tanks", "pumps"],
  grejanje_hladjenje:     ["boilers_heating", "radiators", "underfloor_heating", "air_conditioning", "heat_pumps", "ventilation"],
  unutrasnje_zavrse:      ["tiles", "granite_tiles", "marble_tiles", "tile_adhesives", "interior_doors", "paints", "primers", "parquet", "laminate", "vinyl_flooring", "floor_trims"],
  zavrse_radovi:          ["tiles", "granite_tiles", "marble_tiles", "tile_adhesives", "interior_doors", "paints", "primers", "parquet", "laminate", "vinyl_flooring"],
  instalacije:            ["faucets", "sinks", "pipes_fittings", "valves", "water_heaters", "pumps"],
  fasada:                 ["etics_systems", "insulation_thermal", "waterproofing", "paints", "primers"],

  // ── Dvorište category IDs ─────────────────────────────────────────────────
  priprema_terena:        ["construction_chemicals", "waterproofing"],
  staze_terase:           ["paving", "tile_adhesives", "construction_chemicals"],
  zelene_povrsine:        ["lawn", "irrigation"],
  ograde_kapije:          ["fences", "gates", "gate_motors"],
  navodnjavanje:          ["irrigation", "pumps"],
  rasveta:                ["outdoor_lighting", "electrical_cables"],
  pergola_mobilijar:      ["timber_lumber", "osb_boards"],
  dvorisni_objekat:       ["masonry_blocks", "cement_mortar", "timber_lumber", "roofing_tiles"],
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
