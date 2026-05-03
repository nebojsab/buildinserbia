import type { PriceRange } from "../wizardTree/types";

// All prices in EUR, labour only (no materials/fixtures unless noted)
// Last reviewed: 2026 Serbian market rates
export const subPriceRanges: Record<string, PriceRange> = {
  // KUPATILO
  kupatilo_kompletno:       { low: 150, high: 280, unit: "m2",    quantityField: "povrsina" },
  kupatilo_keramika_dem:    { low: 25,  high: 45,  unit: "m2",    quantityFields: ["povrsina_poda", "povrsina_zidova"] },
  kupatilo_keramika_bez:    { low: 15,  high: 30,  unit: "m2",    quantityFields: ["povrsina_poda", "povrsina_zidova"] },
  kupatilo_sanitarije_dem:  { low: 150, high: 500, unit: "pausal" },
  kupatilo_sanitarije_bez:  { low: 100, high: 300, unit: "pausal" },
  kupatilo_instalacije:     { low: 80,  high: 180, unit: "m2",    quantityField: "povrsina" },

  // PODOVI (podovi_raspored is a planning step, no labour cost)
  podovi_parket:            { low: 15,  high: 35,  unit: "m2",    quantityField: "povrsina" },
  podovi_laminat:           { low: 8,   high: 18,  unit: "m2",    quantityField: "povrsina" },
  podovi_keramika:          { low: 15,  high: 30,  unit: "m2",    quantityField: "povrsina" },
  podovi_mikrocement:       { low: 35,  high: 70,  unit: "m2",    quantityField: "povrsina" },
  podovi_brodski:           { low: 12,  high: 25,  unit: "m2",    quantityField: "povrsina" },
  podovi_epoxy:             { low: 20,  high: 45,  unit: "m2",    quantityField: "povrsina" },
  podovi_vinil:             { low: 8,   high: 18,  unit: "m2",    quantityField: "povrsina" },

  // ZIDOVI I PLAFONI
  zidovi_krecenje:          { low: 4,   high: 14,  unit: "m2",    quantityField: "povrsina_zidova" },
  zidovi_gipskarton:        { low: 20,  high: 40,  unit: "m2",    quantityField: "povrsina" },
  zidovi_dekorativni_malter:{ low: 25,  high: 60,  unit: "m2",    quantityField: "povrsina" },
  zidovi_tapete:            { low: 8,   high: 20,  unit: "m2",    quantityField: "povrsina" },

  // PROZORI I VRATA
  prozori_zamena:           { low: 60,  high: 150, unit: "kom",   quantityField: "broj_prozora" },
  vrata_unutrasnja:         { low: 80,  high: 200, unit: "kom",   quantityField: "broj_vrata" },
  vrata_ulazna:             { low: 200, high: 500, unit: "kom",   quantityField: "broj_vrata" },

  // ELEKTRIKA
  elektrika_kompletna:      { low: 15,  high: 30,  unit: "m2",    quantityField: "povrsina" },
  elektrika_delimicna:      { low: 300, high: 1500, unit: "pausal" },
  elektrika_klima:          { low: 200, high: 500, unit: "kom",   quantityField: "broj_jedinica" },
  elektrika_smarthome:      { low: 1500, high: 8000, unit: "pausal" },

  // VODOVOD
  vodovod_kompletna_zamena: { low: 20,  high: 40,  unit: "m2",    quantityField: "povrsina" },
  vodovod_delimicna:        { low: 300, high: 1200, unit: "pausal" },
  vodovod_bojler:           { low: 150, high: 500, unit: "pausal" },

  // GREJANJE
  grejanje_kotao:           { low: 600, high: 2500, unit: "pausal" },
  grejanje_radijatori:      { low: 100, high: 250, unit: "kom",   quantityField: "broj_radijatora" },
  grejanje_podno:           { low: 25,  high: 55,  unit: "m2",    quantityField: "povrsina" },

  // KUHINJA
  kuhinja_namestaj:         { low: 400, high: 1500, unit: "pausal" },
  kuhinja_keramika:         { low: 15,  high: 30,  unit: "m2",    quantityField: "povrsina_poda" },
  kuhinja_instalacije:      { low: 300, high: 900, unit: "pausal" },

  // FASADA I IZOLACIJA
  fasada_stiropor:          { low: 30,  high: 60,  unit: "m2",    quantityField: "povrsina" },
  fasada_kamena_vuna:       { low: 25,  high: 50,  unit: "m2",    quantityField: "povrsina" },
  fasada_hidroizolacija:    { low: 20,  high: 50,  unit: "m2",    quantityField: "povrsina" },

  // KROV
  krov_zamena_pokrivaca:         { low: 25,  high: 55,  unit: "m2", quantityField: "povrsina" },
  krov_termoizolacija_potkrovlja:{ low: 20,  high: 45,  unit: "m2", quantityField: "povrsina" },
  krov_reparatura:               { low: 300, high: 2500, unit: "pausal" },
};

export const zoneMultipliers: Record<string, number> = {
  gradska:    1.0,
  prigradska: 0.9,
  seoska:     0.8,
};

export function getQuantity(pr: PriceRange, vals: Record<string, unknown>): number | null {
  if (pr.unit === "pausal") return null;
  const keys = pr.quantityFields ?? (pr.quantityField ? [pr.quantityField] : []);
  let sum = 0;
  let found = false;
  for (const k of keys) {
    const v = vals[k];
    if (typeof v === "number" && v > 0) { sum += v; found = true; }
  }
  return found ? sum : null;
}
