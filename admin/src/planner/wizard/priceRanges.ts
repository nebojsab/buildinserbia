import type { PriceRange } from "../wizardTree/types";

// All prices in EUR, labour only (no materials/fixtures unless noted)
// Last reviewed: 2026 Serbian market rates
export const subPriceRanges: Record<string, PriceRange> = {

  // ─── IZGRADNJA: Projektna dokumentacija ──────────────────────────────────────
  // Professional fees only; takse i naknade nisu uključene
  dok_idejni:                   { low: 800,  high: 2500,  unit: "pausal" },
  dok_gradevinska_dozvola:      { low: 300,  high: 1200,  unit: "pausal" },
  dok_izvodjacki:               { low: 1500, high: 4500,  unit: "pausal" },

  // ─── TEMELJI I ISKOP ─────────────────────────────────────────────────────────
  // Labour only; materials (beton, armatura, oplata) nisu uključeni
  iskop:                        { low: 8,    high: 22,    unit: "m2",   quantityField: "povrsina_iskopa" },
  temelji_temeljne_trake:       { low: 35,   high: 85,    unit: "m2",   quantityField: "povrsina_temelja" },
  // Dogradnja: iskop + betonski temelji kombinovano
  temelji_iskop:                { low: 45,   high: 110,   unit: "m2",   quantityField: "povrsina_iskopa" },
  // Ojačanje konstrukcije za nadogradnju — zavisi od elaborata
  temelji_ojacanje:             { low: 2000, high: 8000,  unit: "pausal" },

  // ─── IZGRADNJA: Konstruktivni sistem ─────────────────────────────────────────
  konstrukcija_zidanje:         { low: 25,   high: 55,    unit: "m2",   quantityField: "povrsina_objekta" },
  konstrukcija_ploce:           { low: 35,   high: 75,    unit: "m2",   quantityField: "povrsina_ploce" },
  // konstrukcija_stepenice — pausal, zavisi od tipa i broja etaža
  konstrukcija_stepenice:       { low: 1500, high: 6000,  unit: "pausal" },

  // ─── IZGRADNJA / DOGRADNJA: Krov ─────────────────────────────────────────────
  krov_konstrukcija:            { low: 20,   high: 45,    unit: "m2",   quantityField: "povrsina_krova" },
  krov_pokrivac:                { low: 15,   high: 35,    unit: "m2",   quantityField: "povrsina_krova" },

  // ─── IZGRADNJA / DOGRADNJA: Fasada ───────────────────────────────────────────
  fasada_etics:                 { low: 25,   high: 55,    unit: "m2",   quantityField: "povrsina" },
  fasada_malterisanje:          { low: 12,   high: 25,    unit: "m2",   quantityField: "povrsina" },
  // Dogradnja: fasada nove etaže / horizontalnog proširenja
  fasada:                       { low: 25,   high: 55,    unit: "m2",   quantityField: "povrsina" },
  fasada_postojeca_osvezavanje: { low: 10,   high: 22,    unit: "m2",   quantityField: "povrsina" },

  // ─── IZGRADNJA / DOGRADNJA: Spoljna stolarija ────────────────────────────────
  // quantityFields covers both izgradnja ("broj_prozora") and dogradnja ("broj")
  stolarija_prozori:            { low: 50,   high: 120,   unit: "kom",  quantityFields: ["broj_prozora", "broj"] },
  stolarija_ulazna_vrata:       { low: 200,  high: 600,   unit: "pausal" },
  stolarija_garazna_vrata:      { low: 300,  high: 800,   unit: "pausal" },
  stolarija_krovni_prozori:     { low: 80,   high: 200,   unit: "kom",  quantityField: "broj" },
  // Dogradnja: spajanje sa postojećim (otvori/prolazi)
  konstrukcija_spajanje:        { low: 400,  high: 1500,  unit: "kom",  quantityField: "broj_otvora" },

  // ─── IZGRADNJA: Elektroinstalacije ───────────────────────────────────────────
  elektro_kompletna:            { low: 15,   high: 30,    unit: "m2",   quantityField: "povrsina" },
  elektro_slaba_struja:         { low: 800,  high: 3500,  unit: "pausal" },
  elektro_solar:                { low: 250,  high: 600,   unit: "kom",  quantityField: "snaga_kwp" },

  // ─── IZGRADNJA: ViK instalacije ──────────────────────────────────────────────
  vik_kompletna:                { low: 25,   high: 50,    unit: "m2",   quantityField: "povrsina" },

  // ─── IZGRADNJA: Grejanje / hlađenje ──────────────────────────────────────────
  // grejanje_kotao pokriven i za renovaciju (isti ID)
  grejanje_klima:               { low: 150,  high: 400,   unit: "kom",  quantityField: "broj_unutrasnjih" },
  grejanje_rekuperacija:        { low: 30,   high: 70,    unit: "m2",   quantityField: "povrsina" },

  // ─── IZGRADNJA / DOGRADNJA: Unutrašnje završne radove ────────────────────────
  zavrse_malterisanje:          { low: 8,    high: 20,    unit: "m2",   quantityField: "povrsina" },
  zavrse_krecenje:              { low: 4,    high: 14,    unit: "m2",   quantityField: "povrsina" },
  zavrse_unutrasnja_stolarija:  { low: 60,   high: 180,   unit: "kom",  quantityField: "broj_vrata" },
  // Dogradnja finishing
  zavrse_radovi:                { low: 8,    high: 20,    unit: "m2",   quantityField: "povrsina" },
  zavrse_stolarija:             { low: 60,   high: 180,   unit: "kom",  quantityField: "broj_vrata" },
  zavrse_podovi:                { low: 10,   high: 28,    unit: "m2",   quantityField: "povrsina" },

  // ─── DOGRADNJA: Krov dogradnje ───────────────────────────────────────────────
  // Combined construction + covering; rate per m² of roof area
  konstrukcija_krov_dogradnje:  { low: 35,   high: 80,    unit: "m2",   quantityField: "povrsina_krova" },

  // ─── DOGRADNJA: Fasada nove etaže / proširenja ───────────────────────────────
  fasada_nova:                  { low: 25,   high: 55,    unit: "m2",   quantityField: "povrsina" },

  // ─── DOGRADNJA: Instalacije (pausal — nema merljive površine) ────────────────
  inst_elektrika:               { low: 800,  high: 2500,  unit: "pausal" },
  inst_vik:                     { low: 600,  high: 2000,  unit: "pausal" },
  inst_grejanje:                { low: 400,  high: 1800,  unit: "pausal" },

  // ─── RENOVACIJA: Kupatilo ────────────────────────────────────────────────────
  kupatilo_kompletno:           { low: 150,  high: 280,   unit: "m2",   quantityField: "povrsina" },
  kupatilo_keramika_dem:        { low: 25,   high: 45,    unit: "m2",   quantityFields: ["povrsina_poda", "povrsina_zidova"] },
  kupatilo_keramika_bez:        { low: 15,   high: 30,    unit: "m2",   quantityFields: ["povrsina_poda", "povrsina_zidova"] },
  kupatilo_sanitarije_dem:      { low: 150,  high: 500,   unit: "pausal" },
  kupatilo_sanitarije_bez:      { low: 100,  high: 300,   unit: "pausal" },
  kupatilo_instalacije:         { low: 80,   high: 180,   unit: "m2",   quantityField: "povrsina" },

  // ─── RENOVACIJA: Podovi ──────────────────────────────────────────────────────
  // podovi_raspored — planning step, no labour cost
  podovi_parket:                { low: 15,   high: 35,    unit: "m2",   quantityField: "povrsina" },
  podovi_laminat:               { low: 8,    high: 18,    unit: "m2",   quantityField: "povrsina" },
  podovi_keramika:              { low: 15,   high: 30,    unit: "m2",   quantityField: "povrsina" },
  podovi_mikrocement:           { low: 35,   high: 70,    unit: "m2",   quantityField: "povrsina" },
  podovi_brodski:               { low: 12,   high: 25,    unit: "m2",   quantityField: "povrsina" },
  podovi_epoxy:                 { low: 20,   high: 45,    unit: "m2",   quantityField: "povrsina" },
  podovi_vinil:                 { low: 8,    high: 18,    unit: "m2",   quantityField: "povrsina" },

  // ─── RENOVACIJA: Zidovi i plafoni ────────────────────────────────────────────
  zidovi_krecenje:              { low: 4,    high: 14,    unit: "m2",   quantityField: "povrsina_zidova" },
  zidovi_gipskarton:            { low: 20,   high: 40,    unit: "m2",   quantityField: "povrsina" },
  zidovi_dekorativni_malter:    { low: 25,   high: 60,    unit: "m2",   quantityField: "povrsina" },
  zidovi_tapete:                { low: 8,    high: 20,    unit: "m2",   quantityField: "povrsina" },

  // ─── RENOVACIJA: Prozori i vrata ─────────────────────────────────────────────
  prozori_zamena:               { low: 60,   high: 150,   unit: "kom",  quantityField: "broj_prozora" },
  vrata_unutrasnja:             { low: 80,   high: 200,   unit: "kom",  quantityField: "broj_vrata" },
  vrata_ulazna:                 { low: 200,  high: 500,   unit: "kom",  quantityField: "broj_vrata" },

  // ─── RENOVACIJA: Elektrika ───────────────────────────────────────────────────
  elektrika_kompletna:          { low: 15,   high: 30,    unit: "m2",   quantityField: "povrsina" },
  elektrika_delimicna:          { low: 300,  high: 1500,  unit: "pausal" },
  elektrika_klima:              { low: 200,  high: 500,   unit: "kom",  quantityField: "broj_jedinica" },
  elektrika_smarthome:          { low: 1500, high: 8000,  unit: "pausal" },

  // ─── RENOVACIJA: Vodovodne instalacije ───────────────────────────────────────
  vodovod_kompletna_zamena:     { low: 20,   high: 40,    unit: "m2",   quantityField: "povrsina" },
  vodovod_delimicna:            { low: 300,  high: 1200,  unit: "pausal" },
  vodovod_bojler:               { low: 150,  high: 500,   unit: "pausal" },

  // ─── RENOVACIJA + IZGRADNJA: Grejanje ────────────────────────────────────────
  // grejanje_kotao i grejanje_klima postoje u oba stabla (isti ID)
  grejanje_kotao:               { low: 600,  high: 2500,  unit: "pausal" },
  grejanje_radijatori:          { low: 100,  high: 250,   unit: "kom",  quantityField: "broj_radijatora" },
  grejanje_podno:               { low: 25,   high: 55,    unit: "m2",   quantityField: "povrsina" },

  // ─── RENOVACIJA: Kuhinja ─────────────────────────────────────────────────────
  kuhinja_namestaj:             { low: 400,  high: 1500,  unit: "pausal" },
  kuhinja_keramika:             { low: 15,   high: 30,    unit: "m2",   quantityField: "povrsina_poda" },
  kuhinja_instalacije:          { low: 300,  high: 900,   unit: "pausal" },

  // ─── RENOVACIJA: Fasada i izolacija ──────────────────────────────────────────
  fasada_stiropor:              { low: 30,   high: 60,    unit: "m2",   quantityField: "povrsina" },
  fasada_kamena_vuna:           { low: 25,   high: 50,    unit: "m2",   quantityField: "povrsina" },
  fasada_hidroizolacija:        { low: 20,   high: 50,    unit: "m2",   quantityField: "povrsina" },

  // ─── RENOVACIJA: Krov ────────────────────────────────────────────────────────
  krov_zamena_pokrivaca:        { low: 25,   high: 55,    unit: "m2",   quantityField: "povrsina" },
  krov_termoizolacija_potkrovlja:{ low: 20,  high: 45,    unit: "m2",   quantityField: "povrsina" },
  krov_reparatura:              { low: 300,  high: 2500,  unit: "pausal" },

  // ─── DVORIŠTE ────────────────────────────────────────────────────────────────
  // Priprema terena
  teren_nivelacija:             { low: 3,    high: 10,    unit: "m2",   quantityField: "povrsina" },
  teren_drenaza:                { low: 8,    high: 20,    unit: "m2",   quantityField: "povrsina" },
  // Staze i terase
  terasa:                       { low: 18,   high: 45,    unit: "m2",   quantityField: "povrsina" },
  staze_setniste:               { low: 18,   high: 40,    unit: "lm",   quantityField: "duzina" },
  staze_parking:                { low: 20,   high: 50,    unit: "m2",   quantityField: "povrsina" },
  // Zelene površine
  travnjak:                     { low: 2,    high: 8,     unit: "m2",   quantityField: "povrsina" },
  zelenilo_sadnja:              { low: 500,  high: 3000,  unit: "pausal" },
  // Ograde i kapije
  ograda_ulicna:                { low: 25,   high: 90,    unit: "lm",   quantityField: "duzina" },
  ograda_susedska:              { low: 20,   high: 70,    unit: "lm",   quantityField: "duzina" },
  kapija:                       { low: 400,  high: 2000,  unit: "pausal" },
  // Navodnjavanje
  nav_automatski:               { low: 5,    high: 15,    unit: "m2",   quantityField: "povrsina" },
  nav_bunar:                    { low: 1500, high: 6000,  unit: "pausal" },
  // Rasveta
  rasveta_dvorisna:             { low: 50,   high: 150,   unit: "kom",  quantityField: "broj_tacaka" },
  // Dvorišni objekti
  garaza:                       { low: 400,  high: 900,   unit: "pausal" },
  letnja_kuhinja:               { low: 200,  high: 500,   unit: "m2",   quantityField: "povrsina" },
  ostava_radionica:             { low: 150,  high: 400,   unit: "m2",   quantityField: "povrsina" },
  // Pergola i bazen
  pergola:                      { low: 50,   high: 120,   unit: "m2",   quantityField: "povrsina" },
  bazen:                        { low: 3000, high: 15000, unit: "pausal" },
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
