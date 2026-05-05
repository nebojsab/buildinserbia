import type { CatalogCategory } from "../../types/catalog";

export const categories: CatalogCategory[] = [
  {
    id: "windows",
    title: { sr: "Prozori", en: "Windows", ru: "Okna" },
    description: {
      sr: "PVC/ALU/drvena stolarija i sistemi otvaranja.",
      en: "PVC/ALU/wood windows and opening systems.",
      ru: "PVC/ALU/derevyannye okna i sistemy otkryvaniya.",
    },
    sortOrder: 10,
    isActive: true,
  },
  { id: "shutters", title: { sr: "Roletne", en: "Shutters", ru: "Rolstavni" }, sortOrder: 20, isActive: true },
  { id: "mosquito_nets", title: { sr: "Komarnici", en: "Mosquito nets", ru: "Moskitnye setki" }, sortOrder: 30, isActive: true },
  { id: "shower_cabins", title: { sr: "Tus kabine", en: "Shower cabins", ru: "Dushevye kabiny" }, sortOrder: 40, isActive: true },
  { id: "tiles", title: { sr: "Plocice", en: "Tiles", ru: "Plitka" }, sortOrder: 50, isActive: true },
  { id: "faucets", title: { sr: "Slavine", en: "Faucets", ru: "Smesiteli" }, sortOrder: 60, isActive: true },
  { id: "sinks", title: { sr: "Lavaboi i sudopere", en: "Sinks and basins", ru: "Rakviny i moyki" }, sortOrder: 70, isActive: true },
  { id: "toilets", title: { sr: "WC solje", en: "Toilets", ru: "Unitazy" }, sortOrder: 80, isActive: true },
  { id: "bathroom_furniture", title: { sr: "Kupatilski namestaj", en: "Bathroom furniture", ru: "Mebel dlya vannoy" }, sortOrder: 90, isActive: true },
  { id: "kitchen_elements", title: { sr: "Kuhinjski elementi", en: "Kitchen elements", ru: "Kukhonnye moduli" }, sortOrder: 100, isActive: true },
  { id: "kitchen_sinks", title: { sr: "Kuhinjske sudopere", en: "Kitchen sinks", ru: "Kukhonnye moyki" }, sortOrder: 110, isActive: true },
  { id: "kitchen_faucets", title: { sr: "Kuhinjske slavine", en: "Kitchen faucets", ru: "Kukhonnye smesiteli" }, sortOrder: 120, isActive: true },
  { id: "lighting", title: { sr: "Unutrasnja rasveta", en: "Indoor lighting", ru: "Vnutrennee osveshchenie" }, sortOrder: 130, isActive: true },
  { id: "outdoor_lighting", title: { sr: "Spoljasnja rasveta", en: "Outdoor lighting", ru: "Naruzhnoe osveshchenie" }, sortOrder: 140, isActive: true },
  { id: "fences", title: { sr: "Ograde", en: "Fences", ru: "Zabory" }, sortOrder: 150, isActive: true },
  { id: "gates", title: { sr: "Kapije", en: "Gates", ru: "Vorota" }, sortOrder: 160, isActive: true },
  { id: "gate_motors", title: { sr: "Motori za kapije", en: "Gate motors", ru: "Privody dlya vorot" }, sortOrder: 170, isActive: true },
  { id: "paving", title: { sr: "Poplocavanje", en: "Paving", ru: "Moshchenie" }, sortOrder: 180, isActive: true },
  { id: "irrigation", title: { sr: "Navodnjavanje", en: "Irrigation", ru: "Oroshenie" }, sortOrder: 190, isActive: true },
  { id: "lawn", title: { sr: "Travnjak", en: "Lawn", ru: "Gazonn" }, sortOrder: 200, isActive: true },
  { id: "interior_doors",       title: { sr: "Sobna vrata",              en: "Interior doors",         ru: "Mezhkomnatnye dveri"       }, sortOrder: 210, isActive: true },
  { id: "entrance_doors",       title: { sr: "Ulazna vrata",             en: "Entrance doors",         ru: "Vkhodnye dveri"            }, sortOrder: 220, isActive: true },
  { id: "terrace_doors",        title: { sr: "Terasna vrata",            en: "Terrace doors",          ru: "Terrasnye dveri"           }, sortOrder: 230, isActive: true },
  { id: "garage_doors",         title: { sr: "Garazna vrata",            en: "Garage doors",           ru: "Garazhnye vorota"          }, sortOrder: 240, isActive: true },

  // ── Keramika i podne obloge ───────────────────────────────────────────────
  { id: "tile_adhesives",       title: { sr: "Lepkovi i fugne",          en: "Tile adhesives & grout", ru: "Klej i zatirka dlya plitki" }, sortOrder: 300, isActive: true },
  { id: "granite_tiles",        title: { sr: "Granitne plocice",         en: "Granite tiles",          ru: "Granitna plitka"           }, sortOrder: 310, isActive: true },
  { id: "marble_tiles",         title: { sr: "Mermerne plocice",         en: "Marble tiles",           ru: "Mramornaya plitka"         }, sortOrder: 320, isActive: true },
  { id: "floor_trims",          title: { sr: "Lajsne i rubovi",          en: "Floor trims & edging",   ru: "Plintusa i kanty"          }, sortOrder: 330, isActive: true },
  { id: "tile_tools",           title: { sr: "Alat za keramiku",         en: "Tile tools",             ru: "Instrumenty dlya plitki"   }, sortOrder: 340, isActive: true },
  { id: "parquet",              title: { sr: "Parket",                   en: "Parquet",                ru: "Parket"                    }, sortOrder: 350, isActive: true },
  { id: "laminate",             title: { sr: "Laminat",                  en: "Laminate flooring",      ru: "Laminat"                   }, sortOrder: 360, isActive: true },
  { id: "vinyl_flooring",       title: { sr: "Vinil pod (SPC/LVT)",      en: "Vinyl flooring (SPC/LVT)", ru: "Vinilovoe pokrytie"      }, sortOrder: 370, isActive: true },

  // ── Boje, malteri i fasada ────────────────────────────────────────────────
  { id: "paints",               title: { sr: "Boje i lakovi",            en: "Paints & varnishes",     ru: "Kraski i laki"             }, sortOrder: 400, isActive: true },
  { id: "primers",              title: { sr: "Grundovi i impregnacije",  en: "Primers & sealers",      ru: "Grunty i propitki"         }, sortOrder: 410, isActive: true },
  { id: "decorative_plaster",   title: { sr: "Dekorativni malteri",      en: "Decorative plaster",     ru: "Dekorativnaya shtukaturka" }, sortOrder: 420, isActive: true },
  { id: "etics_systems",        title: { sr: "ETICS fasadni sistemi",    en: "ETICS facade systems",   ru: "Sistemy ETICS"             }, sortOrder: 430, isActive: true },

  // ── Građevinski materijali ────────────────────────────────────────────────
  { id: "masonry_blocks",       title: { sr: "Zidarski blokovi i opeka", en: "Masonry blocks & bricks", ru: "Kladochnye bloki i kirpich" }, sortOrder: 500, isActive: true },
  { id: "cement_mortar",        title: { sr: "Cement, beton i malter",   en: "Cement, concrete & mortar", ru: "Tsement, beton i rastvor" }, sortOrder: 510, isActive: true },
  { id: "reinforcement",        title: { sr: "Armatura i mrezice",       en: "Reinforcement & mesh",   ru: "Armatura i setka"          }, sortOrder: 520, isActive: true },
  { id: "drywall",              title: { sr: "Gips-karton ploce",        en: "Drywall / plasterboard", ru: "Gipsokartonnye listy"      }, sortOrder: 530, isActive: true },
  { id: "drywall_profiles",     title: { sr: "Knauf profili i pribor",   en: "Drywall profiles & fixings", ru: "Profili i krepezh"     }, sortOrder: 540, isActive: true },

  // ── Drvo, ploče i nosači ──────────────────────────────────────────────────
  { id: "timber_lumber",        title: { sr: "Gradjevinska drvena gradja", en: "Structural timber",    ru: "Stroitelnaya drevesina"    }, sortOrder: 560, isActive: true },
  { id: "osb_boards",           title: { sr: "OSB ploce i sperploce",    en: "OSB & plywood boards",   ru: "OSB i fanera"              }, sortOrder: 570, isActive: true },
  { id: "panel_boards",         title: { sr: "Knauf i MDF ploce",        en: "Panel boards (MDF/PB)",  ru: "Panelnye plity"            }, sortOrder: 580, isActive: true },

  // ── Krov ─────────────────────────────────────────────────────────────────
  { id: "roofing_tiles",        title: { sr: "Krovni pokrivaci i lim",   en: "Roof tiles & metal",     ru: "Krovelnye pokrytiya"       }, sortOrder: 600, isActive: true },
  { id: "roof_membranes",       title: { sr: "Krovne membrane i folije", en: "Roof membranes & underlays", ru: "Krovelnye membrany"   }, sortOrder: 610, isActive: true },
  { id: "gutters",              title: { sr: "Oluke i odvodni sistemi",  en: "Gutters & drainage",     ru: "Vodostoki i drenazh"       }, sortOrder: 620, isActive: true },

  // ── Izolacija i hidroizolacija ────────────────────────────────────────────
  { id: "insulation_thermal",   title: { sr: "Termoizolacija",           en: "Thermal insulation",     ru: "Teploizolyatsiya"          }, sortOrder: 640, isActive: true },
  { id: "insulation_acoustic",  title: { sr: "Zvucna izolacija",         en: "Acoustic insulation",    ru: "Zvukoizolyatsiya"          }, sortOrder: 650, isActive: true },
  { id: "waterproofing",        title: { sr: "Hidroizolacija",           en: "Waterproofing",          ru: "Gidroizolyatsiya"          }, sortOrder: 660, isActive: true },

  // ── Hemija i lepkovi ──────────────────────────────────────────────────────
  { id: "adhesives_sealants",   title: { sr: "Lepkovi i silikoni",       en: "Adhesives & sealants",   ru: "Kleyi i germetiki"         }, sortOrder: 680, isActive: true },
  { id: "construction_chemicals", title: { sr: "Gradjevinska hemija",    en: "Construction chemicals", ru: "Stroitelnaya khimiya"      }, sortOrder: 690, isActive: true },

  // ── ViK instalacije ───────────────────────────────────────────────────────
  { id: "pipes_fittings",       title: { sr: "Cevi i fitinzi",           en: "Pipes & fittings",       ru: "Truby i fittingi"          }, sortOrder: 700, isActive: true },
  { id: "water_heaters",        title: { sr: "Bojleri i akumulatori",    en: "Water heaters & boilers", ru: "Bojlery i nakopiteli"     }, sortOrder: 710, isActive: true },
  { id: "septic_tanks",         title: { sr: "Septicke jame i kanalizacija", en: "Septic tanks & sewage", ru: "Septiki i kanalizatsiya" }, sortOrder: 720, isActive: true },
  { id: "valves",               title: { sr: "Ventili i slavine (instal.)", en: "Valves & stopcocks",  ru: "Klapany i zapornaya armatura" }, sortOrder: 730, isActive: true },
  { id: "pumps",                title: { sr: "Pumpe",                    en: "Pumps",                  ru: "Nasosy"                    }, sortOrder: 740, isActive: true },

  // ── Sanitarije ────────────────────────────────────────────────────────────
  { id: "bidets",               title: { sr: "Bidei",                    en: "Bidets",                 ru: "Bide"                      }, sortOrder: 760, isActive: true },
  { id: "bathtubs",             title: { sr: "Kade",                     en: "Bathtubs",               ru: "Vanny"                     }, sortOrder: 770, isActive: true },
  { id: "mirrors",              title: { sr: "Ogledala",                 en: "Mirrors",                ru: "Zerkala"                   }, sortOrder: 780, isActive: true },
  { id: "towel_radiators",      title: { sr: "Peskirgrejaci",            en: "Towel radiators",        ru: "Polotencesushiteli"        }, sortOrder: 790, isActive: true },
  { id: "bathroom_accessories", title: { sr: "Kupatilski pribor",        en: "Bathroom accessories",   ru: "Santekhnicheskiye aksessuary" }, sortOrder: 800, isActive: true },

  // ── Grejanje i klima ──────────────────────────────────────────────────────
  { id: "boilers_heating",      title: { sr: "Kotlovi za grejanje",      en: "Heating boilers",        ru: "Otopitelnye kotly"         }, sortOrder: 820, isActive: true },
  { id: "radiators",            title: { sr: "Radijatori",               en: "Radiators",              ru: "Radiatory"                 }, sortOrder: 830, isActive: true },
  { id: "underfloor_heating",   title: { sr: "Podno grejanje",           en: "Underfloor heating",     ru: "Teplyi pol"                }, sortOrder: 840, isActive: true },
  { id: "air_conditioning",     title: { sr: "Klima uredjaji",           en: "Air conditioning",       ru: "Konditsionery"             }, sortOrder: 850, isActive: true },
  { id: "heat_pumps",           title: { sr: "Toplotne pumpe",           en: "Heat pumps",             ru: "Teplovye nasosy"           }, sortOrder: 860, isActive: true },
  { id: "ventilation",          title: { sr: "Ventilacija i rekuperacija", en: "Ventilation & MVHR",   ru: "Ventilyatsiya i rekuperatsiya" }, sortOrder: 870, isActive: true },

  // ── Elektro ───────────────────────────────────────────────────────────────
  { id: "electrical_cables",    title: { sr: "Elektricni kablovi i zice", en: "Electrical cables & wire", ru: "Elektricheskiye kabelya" }, sortOrder: 890, isActive: true },
  { id: "electrical_panels",    title: { sr: "Razvodni ormari i osiguraci", en: "Distribution boards & breakers", ru: "Schitovoe oborudovanie" }, sortOrder: 900, isActive: true },
  { id: "switches_outlets",     title: { sr: "Prekidaci i uticnice",     en: "Switches & outlets",     ru: "Vyklyuchateli i rozetki"   }, sortOrder: 910, isActive: true },
  { id: "smart_home",           title: { sr: "Pametna kuca sistemi",     en: "Smart home systems",     ru: "Sistemy umnogo doma"       }, sortOrder: 920, isActive: true },

  // ── Alati ─────────────────────────────────────────────────────────────────
  { id: "power_tools",          title: { sr: "Elektricni alat",          en: "Power tools",            ru: "Elektrichesky instrument"  }, sortOrder: 940, isActive: true },
  { id: "hand_tools",           title: { sr: "Rucni alat",               en: "Hand tools",             ru: "Ruchnoy instrument"        }, sortOrder: 950, isActive: true },
  { id: "measuring_tools",      title: { sr: "Merni instrumenti",        en: "Measuring tools",        ru: "Izmeritelnye instrumenty"  }, sortOrder: 960, isActive: true },
  { id: "safety_equipment",     title: { sr: "Zastitna oprema",          en: "Safety equipment",       ru: "Sredstva zashchity"        }, sortOrder: 970, isActive: true },
];
