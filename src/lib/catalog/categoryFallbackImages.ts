export const CATEGORY_FALLBACK: Record<string, string> = {
  // Openings
  windows:              "/catalog-categories/windows.jpeg",
  shutters:             "/catalog-categories/windows.jpeg",
  mosquito_nets:        "/catalog-categories/windows.jpeg",
  interior_doors:       "/catalog-categories/door.jpeg",
  entrance_doors:       "/catalog-categories/door.jpeg",
  terrace_doors:        "/catalog-categories/door.jpeg",
  garage_doors:         "/catalog-categories/garage-door.jpeg",

  // Bathroom
  shower_cabins:        "/catalog-categories/shower.jpeg",
  tiles:                "/catalog-categories/tiles.jpeg",
  granite_tiles:        "/catalog-categories/tiles.jpeg",
  marble_tiles:         "/catalog-categories/tiles.jpeg",
  faucets:              "/catalog-categories/faucet.jpeg",
  sinks:                "/catalog-categories/sink.jpeg",
  toilets:              "/catalog-categories/toilet.jpeg",
  bidets:               "/catalog-categories/toilet.jpeg",
  bathtubs:             "/catalog-categories/bathtub.jpeg",
  mirrors:              "/catalog-categories/mirror.jpeg",
  towel_radiators:      "/catalog-categories/towel-radiator.jpeg",
  bathroom_furniture:   "/catalog-categories/bathroom-furniture.jpeg",
  bathroom_accessories: "/catalog-categories/bathroom-furniture.jpeg",

  // Kitchen
  kitchen_elements:     "/catalog-categories/kitchen.jpeg",
  kitchen_sinks:        "/catalog-categories/sink.jpeg",
  kitchen_faucets:      "/catalog-categories/faucet.jpeg",

  // Lighting
  lighting:             "/catalog-categories/lighting.jpeg",
  outdoor_lighting:     "/catalog-categories/outdoor-lighting.jpeg",

  // Outdoor / plot
  fences:               "/catalog-categories/fence.jpeg",
  gates:                "/catalog-categories/gate.jpeg",
  gate_motors:          "/catalog-categories/gate.jpeg",
  paving:               "/catalog-categories/paving.jpeg",
  irrigation:           "/catalog-categories/irrigation.jpeg",
  lawn:                 "/catalog-categories/lawn.jpeg",

  // Flooring
  tile_adhesives:       "/catalog-categories/tiles.jpeg",
  floor_trims:          "/catalog-categories/parquet.jpeg",
  tile_tools:           "/catalog-categories/tools.jpeg",
  parquet:              "/catalog-categories/parquet.jpeg",
  laminate:             "/catalog-categories/parquet.jpeg",
  vinyl_flooring:       "/catalog-categories/parquet.jpeg",

  // Walls & surfaces
  paints:               "/catalog-categories/paint.jpeg",
  primers:              "/catalog-categories/paint.jpeg",
  decorative_plaster:   "/catalog-categories/paint.jpeg",
  etics_systems:        "/catalog-categories/facade.jpeg",
  adhesives_sealants:   "/catalog-categories/adhesive.jpeg",
  construction_chemicals: "/catalog-categories/adhesive.jpeg",

  // Structure
  masonry_blocks:       "/catalog-categories/masonry.jpeg",
  cement_mortar:        "/catalog-categories/masonry.jpeg",
  reinforcement:        "/catalog-categories/masonry.jpeg",
  drywall:              "/catalog-categories/drywall.jpeg",
  drywall_profiles:     "/catalog-categories/drywall.jpeg",
  timber_lumber:        "/catalog-categories/timber.jpeg",
  osb_boards:           "/catalog-categories/timber.jpeg",
  panel_boards:         "/catalog-categories/timber.jpeg",

  // Roof
  roofing_tiles:        "/catalog-categories/roofing.jpeg",
  roof_membranes:       "/catalog-categories/roofing.jpeg",
  gutters:              "/catalog-categories/gutter.jpeg",

  // Insulation
  insulation_thermal:   "/catalog-categories/insulation.jpeg",
  insulation_acoustic:  "/catalog-categories/insulation.jpeg",
  waterproofing:        "/catalog-categories/waterproofing.jpeg",

  // Plumbing
  pipes_fittings:       "/catalog-categories/pipes.jpeg",
  valves:               "/catalog-categories/pipes.jpeg",
  pumps:                "/catalog-categories/pump.jpeg",
  water_heaters:        "/catalog-categories/water-heater.jpeg",
  septic_tanks:         "/catalog-categories/septic.jpeg",

  // Heating & HVAC
  boilers_heating:      "/catalog-categories/heating.jpeg",
  radiators:            "/catalog-categories/radiator.jpeg",
  underfloor_heating:   "/catalog-categories/radiator.jpeg",
  air_conditioning:     "/catalog-categories/ac.jpeg",
  heat_pumps:           "/catalog-categories/ac.jpeg",
  ventilation:          "/catalog-categories/ventilation.jpeg",

  // Electrical
  electrical_cables:    "/catalog-categories/electrical.jpeg",
  electrical_panels:    "/catalog-categories/electrical.jpeg",
  switches_outlets:     "/catalog-categories/electrical.jpeg",
  smart_home:           "/catalog-categories/smart-home.jpeg",

  // Tools
  power_tools:          "/catalog-categories/tools.jpeg",
  hand_tools:           "/catalog-categories/tools.jpeg",
  measuring_tools:      "/catalog-categories/tools.jpeg",
  safety_equipment:     "/catalog-categories/tools.jpeg",
};

export function getCategoryFallback(categoryId: string): string {
  return CATEGORY_FALLBACK[categoryId] ?? "/catalog-categories/default.jpeg";
}
