import type { WizardProjectTree } from "./types";

export const dvoristTree: WizardProjectTree = {
  projectType: "yard",
  label: { sr: "Dvorište", en: "Yard / garden" },
  categories: [

    // ─────────────────────────────────────────────────────────
    // 1. NIVELACIJA I PRIPREMA TERENA
    // ─────────────────────────────────────────────────────────
    {
      id: "priprema_terena",
      label: { sr: "Nivelacija i priprema terena", en: "Levelling & ground preparation" },
      icon: "layers",
      subcategories: [
        {
          id: "teren_nivelacija",
          label: { sr: "Nivelacija dvorišta", en: "Yard levelling" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina dvorišta", en: "Yard area" },
              importance: "required",
              unit: "m²",
              predefined: [50, 100, 150, 200, 300, 500],
              unknownAllowed: true,
            },
            {
              key: "nagib",
              kind: "select",
              label: { sr: "Konfiguracija terena", en: "Terrain configuration" },
              importance: "required",
              options: [
                { value: "ravan", label: { sr: "Ravan teren (minimalna nivelacija)", en: "Flat (minimal levelling)" } },
                { value: "blagi_nagib", label: { sr: "Blagi nagib (do 5%)", en: "Gentle slope (up to 5%)" } },
                { value: "strmi_nagib", label: { sr: "Strmi nagib (> 5%) — potporni zidovi", en: "Steep slope (> 5%) — retaining walls needed" } },
              ],
            },
            {
              key: "iskop_nasip",
              kind: "select",
              label: { sr: "Iskop ili nasipanje", en: "Cut or fill" },
              importance: "optional",
              options: [
                { value: "iskop", label: { sr: "Iskop i odvoz viška zemlje", en: "Excavate and remove surplus spoil" } },
                { value: "nasipanje", label: { sr: "Nasipanje (dovoz plodne ili tehničke zemlje)", en: "Fill (import topsoil or sub-base)" } },
                { value: "kombinovano", label: { sr: "Kombinovano — raskopavanje i preraspoređivanje", en: "Combined — cut and redistribute" } },
              ],
            },
            {
              key: "potporni_zidovi",
              kind: "toggle",
              label: { sr: "Izgradnja potpornih zidova", en: "Retaining walls" },
              importance: "optional",
            },
            {
              key: "potporni_materijal",
              kind: "select",
              label: { sr: "Materijal potpornih zidova", en: "Retaining wall material" },
              importance: "optional",
              options: [
                { value: "ab_zid", label: { sr: "Armirani beton", en: "Reinforced concrete" } },
                { value: "gabioni", label: { sr: "Gabioni (kamena korpa)", en: "Gabion baskets" } },
                { value: "betonski_blokovi", label: { sr: "Betonski blokovi (palisade)", en: "Concrete block / palisade" } },
                { value: "drvene_grede", label: { sr: "Drvene grede (rustika)", en: "Timber sleepers (rustic)" } },
              ],
              showWhen: { potporni_zidovi: true },
            },
          ],
        },
        {
          id: "teren_drenaza",
          label: { sr: "Drenažni sistem i odvod kišnice", en: "Drainage & stormwater management" },
          fields: [
            {
              key: "tip",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "drenazne_cevi", label: { sr: "Drenažne cevi (perforisan dren)", en: "Perforated drain pipes" } },
                { value: "slivnici", label: { sr: "Slivnici i šahtovi", en: "Drain inlets & inspection chambers" } },
                { value: "francesa_drenaza", label: { sr: "Francuska drenaža (šljunčani rov)", en: "French drain (gravel trench)" } },
                { value: "cisterna_kisnicu", label: { sr: "Cisterna za prikupljanje kišnice", en: "Rainwater harvesting tank" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina za dreniranje", en: "Area to drain" },
              importance: "required",
              unit: "m²",
              predefined: [50, 100, 150, 200, 300],
              unknownAllowed: true,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 2. STAZE, TERASE I POPLOČAVANJE
    // ─────────────────────────────────────────────────────────
    {
      id: "staze_terase",
      label: { sr: "Staze, terase i popločavanje", en: "Paths, terraces & paving" },
      icon: "square",
      subcategories: [
        {
          id: "terasa",
          label: { sr: "Terasa / trem", en: "Terrace / patio" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina terase", en: "Terrace area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 30, 40, 50],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal terase", en: "Terrace material" },
              importance: "required",
              options: [
                { value: "beton_stampani", label: { sr: "Štampani / dekorativni beton", en: "Stamped / decorative concrete" } },
                { value: "betonske_ploce", label: { sr: "Betonske ploče (šajba)", en: "Concrete paving slabs" } },
                { value: "granitne_kocke", label: { sr: "Granitne kocke / granit ploče", en: "Granite setts / granite slabs" } },
                { value: "keramika_spoljna", label: { sr: "Spoljašnja keramika (Frost-proof)", en: "External tiles (frost-proof)" } },
                { value: "drvo_spoljna", label: { sr: "Drvena terasa (Thermowood / Bangkirai)", en: "Timber decking (Thermowood / Bangkirai)" } },
                { value: "wpc_decking", label: { sr: "WPC (drvo-plastika) decking", en: "WPC (wood-plastic composite) decking" } },
                { value: "prirodni_kamen", label: { sr: "Prirodni kamen (krečnjak, pješčar)", en: "Natural stone (limestone, sandstone)" } },
              ],
            },
            {
              key: "krovica_nadstresnica",
              kind: "toggle",
              label: { sr: "Nadstrešnica / pergola iznad terase", en: "Canopy / pergola over terrace" },
              importance: "optional",
            },
          ],
        },
        {
          id: "staze_setniste",
          label: { sr: "Staze i šetišta", en: "Garden paths & walkways" },
          fields: [
            {
              key: "duzina",
              kind: "length",
              label: { sr: "Ukupna dužina staza", en: "Total path length" },
              importance: "required",
              unit: "m",
              predefined: [10, 20, 30, 40, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "sirina",
              kind: "select",
              label: { sr: "Širina staze", en: "Path width" },
              importance: "optional",
              options: [
                { value: "80cm", label: { sr: "80 cm (prolazna)", en: "80 cm (single passage)" } },
                { value: "100cm", label: { sr: "100 cm (standard)", en: "100 cm (standard)" } },
                { value: "120cm", label: { sr: "120 cm i više (šira)", en: "120 cm + (wide)" } },
              ],
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal staze", en: "Path material" },
              importance: "required",
              options: [
                { value: "betonske_ploce", label: { sr: "Betonske ploče", en: "Concrete slabs" } },
                { value: "sitna_oblutka_pesak", label: { sr: "Sitni oblutci / pesak", en: "Gravel / pea shingle" } },
                { value: "granitne_kocke", label: { sr: "Granitne kocke", en: "Granite setts" } },
                { value: "beton_stampani", label: { sr: "Štampani beton", en: "Stamped concrete" } },
                { value: "drvo_podloge", label: { sr: "Drvene podloge (stepping pads)", en: "Timber stepping pads" } },
              ],
            },
          ],
        },
        {
          id: "staze_parking",
          label: { sr: "Parking / garage pad", en: "Driveway / parking area" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina parkinga / pristupne staze", en: "Driveway / parking area" },
              importance: "required",
              unit: "m²",
              predefined: [15, 20, 30, 40, 50, 60],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material" },
              importance: "required",
              options: [
                { value: "beton", label: { sr: "Beton (armiran)", en: "Reinforced concrete" } },
                { value: "asfalt", label: { sr: "Asfalt", en: "Asphalt" } },
                { value: "granitne_kocke", label: { sr: "Granitne kocke", en: "Granite setts" } },
                { value: "beton_kocke", label: { sr: "Betonski opločnik", en: "Concrete block paving (CBP)" } },
                { value: "travne_resetke", label: { sr: "Travne rešetke (gazon blok)", en: "Grass reinforcement mesh / grid" } },
              ],
            },
            {
              key: "broj_mesta",
              kind: "number",
              label: { sr: "Broj parking mesta", en: "Number of parking spaces" },
              importance: "optional",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 3. ZELENE POVRŠINE
    // ─────────────────────────────────────────────────────────
    {
      id: "zelene_povrsine",
      label: { sr: "Zelene površine", en: "Lawn & planting" },
      icon: "leaf",
      subcategories: [
        {
          id: "travnjak",
          label: { sr: "Travnjak", en: "Lawn" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina travnjaka", en: "Lawn area" },
              importance: "required",
              unit: "m²",
              predefined: [30, 50, 80, 100, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip travnjaka", en: "Lawn type" },
              importance: "required",
              options: [
                { value: "setva_semena", label: { sr: "Setva semena (jeftiniji, duže čekanje)", en: "Seeded lawn (cheaper, longer wait)" } },
                { value: "roll_buseni", label: { sr: "Rolni buseni (instant travnjak)", en: "Turf rolls (instant lawn)" } },
              ],
            },
            {
              key: "priprema_tla",
              kind: "select",
              label: { sr: "Priprema tla", en: "Soil preparation" },
              importance: "required",
              options: [
                { value: "frezanje_dosipanje", label: { sr: "Frezanje + dosipanje plodnog supstrata", en: "Rotavate + topsoil dressing" } },
                { value: "samo_setva", label: { sr: "Samo setva (tlo u dobrom stanju)", en: "Seed only (soil already good)" } },
                { value: "kompletan_supstrat", label: { sr: "Kompletan sloj plodne zemlje (10–15 cm)", en: "Full topsoil layer (10–15 cm)" } },
              ],
            },
            {
              key: "automatsko_navodnjavanje",
              kind: "toggle",
              label: { sr: "Automatsko navodnjavanje travnjaka", en: "Automatic lawn irrigation" },
              importance: "optional",
            },
          ],
        },
        {
          id: "zelenilo_sadnja",
          label: { sr: "Sadnja drveća, živice i cvеtnih lejа", en: "Tree & hedge planting, flower beds" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se sadi", en: "What is being planted" },
              importance: "required",
              options: [
                { value: "drvoredi_stabla", label: { sr: "Drvoredi / ukrasna stabla", en: "Trees / ornamental trees" } },
                { value: "ziva_ograda", label: { sr: "Živa ograda (tuja, lovor, šimšir...)", en: "Hedge (thuja, laurel, box...)" } },
                { value: "cvetne_leje", label: { sr: "Cvetne leje / višegodišnje biljke", en: "Flower beds / perennials" } },
                { value: "voce", label: { sr: "Voćke (jabuka, kruška, šljiva...)", en: "Fruit trees" } },
                { value: "penjalice", label: { sr: "Penjalice (bršljan, wisteria...)", en: "Climbing plants (ivy, wisteria...)" } },
              ],
            },
            {
              key: "projekt_hortikultura",
              kind: "toggle",
              label: { sr: "Potreban projekt hortikulturnog uređenja", en: "Landscape design plan required" },
              importance: "optional",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 4. OGRADE I KAPIJE
    // ─────────────────────────────────────────────────────────
    {
      id: "ograde_kapije",
      label: { sr: "Ograde i kapije", en: "Fencing & gates" },
      icon: "shield",
      subcategories: [
        {
          id: "ograda_ulicna",
          label: { sr: "Ulična ograda", en: "Street-facing fence" },
          fields: [
            {
              key: "duzina",
              kind: "length",
              label: { sr: "Dužina ulične ograde", en: "Street fence length" },
              importance: "required",
              unit: "m",
              predefined: [5, 10, 15, 20, 30, 40],
              unknownAllowed: true,
            },
            {
              key: "visina",
              kind: "select",
              label: { sr: "Visina ograde", en: "Fence height" },
              importance: "required",
              options: [
                { value: "080", label: { sr: "80 cm", en: "80 cm" } },
                { value: "100", label: { sr: "100 cm", en: "100 cm" } },
                { value: "120", label: { sr: "120 cm", en: "120 cm" } },
                { value: "150", label: { sr: "150 cm", en: "150 cm" } },
                { value: "180", label: { sr: "180 cm", en: "180 cm" } },
                { value: "200", label: { sr: "200 cm", en: "200 cm" } },
              ],
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material" },
              importance: "required",
              options: [
                { value: "beton_stubovi_mreza", label: { sr: "Betonski stubovi + žičana mreža (ekonomična)", en: "Concrete posts + wire mesh (economical)" } },
                { value: "celicni_profili", label: { sr: "Čelični profili (cevi + horizontale)", en: "Steel profiles (tubes + horizontals)" } },
                { value: "kovano_gvozdje", label: { sr: "Kovano gvožđe (ukrasno)", en: "Wrought iron (ornamental)" } },
                { value: "beton_puna_ograda", label: { sr: "Puna betonska / AB ograda", en: "Solid concrete / RC fence" } },
                { value: "zidana_ograda", label: { sr: "Zidana ograda (opeka/blok)", en: "Masonry fence (brick/block)" } },
                { value: "drvo", label: { sr: "Drvena ograda (letvice / taraba)", en: "Timber fence (picket / close-board)" } },
                { value: "kompozitna_wpc", label: { sr: "Kompozitna WPC ograda", en: "Composite WPC fence" } },
              ],
            },
            {
              key: "temelj_temenice",
              kind: "toggle",
              label: { sr: "Betonski temelj (temenica) ispod ograde", en: "Concrete foundation strip under fence" },
              importance: "optional",
            },
          ],
        },
        {
          id: "ograda_susedska",
          label: { sr: "Susedska ograda (unutrašnja parcela)", en: "Boundary fence (between properties)" },
          fields: [
            {
              key: "duzina",
              kind: "length",
              label: { sr: "Dužina susedske ograde", en: "Boundary fence length" },
              importance: "required",
              unit: "m",
              predefined: [10, 20, 30, 40, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material" },
              importance: "required",
              options: [
                { value: "zicana_mreza", label: { sr: "Žičana mreža sa stubovima", en: "Chain-link / wire mesh with posts" } },
                { value: "drvo_letvice", label: { sr: "Drvene letvice / taraba", en: "Timber close-board / picket" } },
                { value: "wpc", label: { sr: "WPC kompozitna", en: "WPC composite" } },
                { value: "ziva_ograda", label: { sr: "Živa ograda (bilje)", en: "Hedge (planted)" } },
              ],
            },
          ],
        },
        {
          id: "kapija",
          label: { sr: "Kapija i kapica (ulaz u dvorište)", en: "Gate & pedestrian wicket" },
          fields: [
            {
              key: "tip_kapije",
              kind: "chips",
              label: { sr: "Tip ulaza", en: "Entry type" },
              importance: "required",
              options: [
                { value: "dvokrilna_vozila", label: { sr: "Dvokrilna kapija (vozila)", en: "Double gate (vehicles)" } },
                { value: "klizna_kapija", label: { sr: "Klizna kapija (vozila)", en: "Sliding gate (vehicles)" } },
                { value: "kapica_pesaci", label: { sr: "Kapica za pešake", en: "Pedestrian wicket gate" } },
              ],
            },
            {
              key: "automatika",
              kind: "toggle",
              label: { sr: "Automatski pogon kapije (motor + daljinac)", en: "Automated gate (motor + remote)" },
              importance: "optional",
            },
            {
              key: "interfonska_kamera",
              kind: "toggle",
              label: { sr: "Ugradnja video interfona na kapiji", en: "Video intercom at gate" },
              importance: "optional",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 5. NAVODNJAVANJE
    // ─────────────────────────────────────────────────────────
    {
      id: "navodnjavanje",
      label: { sr: "Navodnjavanje", en: "Irrigation" },
      icon: "droplets",
      subcategories: [
        {
          id: "nav_automatski",
          label: { sr: "Automatski sistem navodnjavanja", en: "Automatic irrigation system" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Ukupna površina za navodnjavanje", en: "Total area to irrigate" },
              importance: "required",
              unit: "m²",
              predefined: [50, 100, 150, 200, 300, 500],
              unknownAllowed: true,
            },
            {
              key: "zone",
              kind: "chips",
              label: { sr: "Zone", en: "Zones" },
              importance: "optional",
              options: [
                { value: "travnjak", label: { sr: "Travnjak (sprinkleri)", en: "Lawn (sprinklers)" } },
                { value: "leje_kapaljke", label: { sr: "Leje / zelenilo (kapajuće cevi)", en: "Beds / shrubs (drip line)" } },
                { value: "vocnjak", label: { sr: "Voćnjak", en: "Orchard" } },
                { value: "povrtnjak", label: { sr: "Povrtnjak / bašta", en: "Vegetable garden" } },
              ],
            },
            {
              key: "vodni_izvor",
              kind: "select",
              label: { sr: "Izvor vode", en: "Water source" },
              importance: "optional",
              options: [
                { value: "vodovodna_mreza", label: { sr: "Vodovodnа mreža", en: "Mains water" } },
                { value: "bunar", label: { sr: "Bunar / bušotina", en: "Well / borehole" } },
                { value: "cisterna_kisnicu", label: { sr: "Cisterna kišnice", en: "Rainwater harvesting tank" } },
              ],
            },
            {
              key: "kontroler_smart",
              kind: "toggle",
              label: { sr: "Smart kontroler (WiFi, vremenski senzor)", en: "Smart controller (WiFi, weather sensor)" },
              importance: "optional",
            },
          ],
        },
        {
          id: "nav_bunar",
          label: { sr: "Bušenje bunara / plitki bunar", en: "Well / borehole drilling" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip bunara", en: "Well type" },
              importance: "required",
              options: [
                { value: "plitki_kopani", label: { sr: "Plitki kopani bunar (do 10 m)", en: "Shallow dug well (up to 10 m)" } },
                { value: "busotina", label: { sr: "Bušotina (arteski, > 20 m)", en: "Borehole (artesian, > 20 m)" } },
              ],
            },
            {
              key: "dubina",
              kind: "number",
              label: { sr: "Procenjena dubina (m)", en: "Estimated depth (m)" },
              importance: "optional",
              unit: "m",
              predefined: [5, 8, 10, 15, 20, 30, 50],
              unknownAllowed: true,
            },
            {
              key: "pumpa",
              kind: "toggle",
              label: { sr: "Ugradnja pumpe i hidroforskog sistema", en: "Install pump & pressure system" },
              importance: "required",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 6. DVORIŠNA RASVETA
    // ─────────────────────────────────────────────────────────
    {
      id: "rasveta",
      label: { sr: "Dvorišna rasveta", en: "Outdoor lighting" },
      icon: "sun",
      subcategories: [
        {
          id: "rasveta_dvorisna",
          label: { sr: "Dvorišna rasveta (tačke i trase)", en: "Garden lighting (points & cable runs)" },
          fields: [
            {
              key: "broj_tacaka",
              kind: "number",
              label: { sr: "Broj svetlosnih tačaka", en: "Number of light points" },
              importance: "required",
              unit: "kom",
              predefined: [4, 6, 8, 10, 15, 20],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "chips",
              label: { sr: "Tip rasvete", en: "Lighting type" },
              importance: "optional",
              options: [
                { value: "stubne_lampe", label: { sr: "Stubne lampe (uz staze)", en: "Post lights (path lighting)" } },
                { value: "zidne_lampe", label: { sr: "Zidne lampe (fasada kuće)", en: "Wall lights (house facade)" } },
                { value: "akcentna_biljke", label: { sr: "Akcentna rasveta (biljke, arhitektura)", en: "Accent lights (plants, architecture)" } },
                { value: "povrsinska_ugradna", label: { sr: "Površinska ugradna (stepenice, staze)", en: "Recessed in-ground (steps, paths)" } },
                { value: "rasveta_terase", label: { sr: "Rasveta terase / pergole", en: "Terrace / pergola lights" } },
              ],
            },
            {
              key: "ukopana_instalacija",
              kind: "toggle",
              label: { sr: "Ukopana instalacija (kablovi u zemlji)", en: "Underground cabling" },
              importance: "required",
            },
            {
              key: "solar_rasveta",
              kind: "toggle",
              label: { sr: "Solarna rasveta (bez ukopavanja)", en: "Solar lights (no cabling needed)" },
              importance: "optional",
            },
            {
              key: "pametna_rasveta",
              kind: "toggle",
              label: { sr: "Pametna rasveta (senzori, timer, app)", en: "Smart lighting (sensors, timer, app)" },
              importance: "optional",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 7. DVORIŠNI OBJEKAT
    // ─────────────────────────────────────────────────────────
    {
      id: "dvorisni_objekat",
      label: { sr: "Dvorišni objekat", en: "Outbuilding" },
      icon: "home",
      subcategories: [
        {
          id: "garaza",
          label: { sr: "Garaža", en: "Garage" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip garaže", en: "Garage type" },
              importance: "required",
              options: [
                { value: "montazna_celicna", label: { sr: "Montažna čelična (brza gradnja)", en: "Prefab steel (quick build)" } },
                { value: "zidana", label: { sr: "Zidana (blok/opeka)", en: "Masonry (block/brick)" } },
                { value: "drvena_montazna", label: { sr: "Drvena montažna (skandinavski tip)", en: "Timber prefab (Scandinavian style)" } },
              ],
            },
            {
              key: "broj_mesta",
              kind: "select",
              label: { sr: "Kapacitet", en: "Capacity" },
              importance: "required",
              options: [
                { value: "jedno", label: { sr: "Jedno vozilo", en: "Single car" } },
                { value: "dva", label: { sr: "Dva vozila", en: "Double car" } },
              ],
            },
            {
              key: "garazna_vrata",
              kind: "select",
              label: { sr: "Tip garažnih vrata", en: "Garage door type" },
              importance: "required",
              options: [
                { value: "sekcijska_auto", label: { sr: "Sekcijska automatska", en: "Sectional automatic" } },
                { value: "krilna", label: { sr: "Krilna", en: "Side-hung" } },
                { value: "klizna", label: { sr: "Klizna", en: "Sliding" } },
              ],
            },
            {
              key: "struja_u_garazi",
              kind: "toggle",
              label: { sr: "Električna instalacija u garaži", en: "Electrical installation in garage" },
              importance: "optional",
            },
          ],
        },
        {
          id: "letnja_kuhinja",
          label: { sr: "Letnja kuhinja / trem", en: "Summer kitchen / covered patio" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina letnje kuhinje", en: "Summer kitchen area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30, 40],
              unknownAllowed: true,
            },
            {
              key: "tip_konstrukcije",
              kind: "select",
              label: { sr: "Tip konstrukcije", en: "Structure type" },
              importance: "required",
              options: [
                { value: "zidana", label: { sr: "Zidana (blok/opeka)", en: "Masonry (block/brick)" } },
                { value: "drvena", label: { sr: "Drvena (pergola + zidovi)", en: "Timber (pergola + walls)" } },
                { value: "celicna_montazna", label: { sr: "Čelična montažna konstrukcija", en: "Steel prefab structure" } },
              ],
            },
            {
              key: "instalacije",
              kind: "chips",
              label: { sr: "Instalacije u letnjoj kuhinji", en: "Services for summer kitchen" },
              importance: "optional",
              options: [
                { value: "struja", label: { sr: "Električna instalacija", en: "Electrical" } },
                { value: "voda", label: { sr: "Vodovod (lavabo, čutura)", en: "Water (sink, tap)" } },
                { value: "gas_rostar", label: { sr: "Priključak za gas (roštilj)", en: "Gas point (BBQ)" } },
              ],
            },
          ],
        },
        {
          id: "ostava_radionica",
          label: { sr: "Ostava / radionica", en: "Garden shed / workshop" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [4, 6, 8, 10, 12, 15],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material" },
              importance: "required",
              options: [
                { value: "drvena_montazna", label: { sr: "Drvena montažna ostava", en: "Timber prefab shed" } },
                { value: "zidana_blok", label: { sr: "Zidana (blok)", en: "Masonry (block)" } },
                { value: "celicna_premontovana", label: { sr: "Čelična premontovana", en: "Steel prefab" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 8. PERGOLA I MOBILIJAR
    // ─────────────────────────────────────────────────────────
    {
      id: "pergola_mobilijar",
      label: { sr: "Pergola i dvorišni mobilijar", en: "Pergola & garden furniture" },
      icon: "umbrella",
      subcategories: [
        {
          id: "pergola",
          label: { sr: "Pergola / nadstrešnica", en: "Pergola / shade structure" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina pergole", en: "Pergola area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal pergole", en: "Pergola material" },
              importance: "required",
              options: [
                { value: "drvo", label: { sr: "Drvo (bor, hrast, thermowood)", en: "Timber (pine, oak, thermowood)" } },
                { value: "aluminijum", label: { sr: "Aluminijum (nisko održavanje)", en: "Aluminium (low maintenance)" } },
                { value: "celicna", label: { sr: "Čelična lamelna pergola", en: "Steel louvred pergola" } },
              ],
            },
            {
              key: "tip_krovine",
              kind: "select",
              label: { sr: "Krovni sistem pergole", en: "Pergola roof type" },
              importance: "optional",
              options: [
                { value: "otvorena_resatkasta", label: { sr: "Otvorena rešetkasta (sjena, ne štiti od kiše)", en: "Open lattice (shade only, not waterproof)" } },
                { value: "polikarbonat", label: { sr: "Polikarbonat (prozirno, štiti od kiše)", en: "Polycarbonate (clear, waterproof)" } },
                { value: "bioklimatska_lamele", label: { sr: "Bioklimatske lamele (podešavajuće)", en: "Bioclimatic louvres (adjustable)" } },
                { value: "canvas_nadstresnica", label: { sr: "Canvas platno / tenda", en: "Canvas / awning" } },
              ],
            },
            {
              key: "rasveta_pergola",
              kind: "toggle",
              label: { sr: "Ugradnja rasvete u pergoли", en: "Integrated pergola lighting" },
              importance: "optional",
            },
          ],
        },
        {
          id: "bazen",
          label: { sr: "Bazen", en: "Swimming pool" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip bazena", en: "Pool type" },
              importance: "required",
              options: [
                { value: "ab_zidan", label: { sr: "AB / zidani (trajni)", en: "Concrete / masonry (permanent)" } },
                { value: "prefabrikovani_liner", label: { sr: "Prefabrikovani sa liner folijom", en: "Prefab with liner" } },
                { value: "container_pool", label: { sr: "Kontejner bazen (modularni)", en: "Container pool (modular)" } },
                { value: "nadzemni", label: { sr: "Nadzemni bazen (privremeni)", en: "Above-ground pool (temporary)" } },
              ],
            },
            {
              key: "dimenzije",
              kind: "text",
              label: { sr: "Dimenzije bazena (dužina × širina × dubina)", en: "Pool dimensions (L × W × depth)" },
              importance: "required",
              placeholder: { sr: "npr. 8×4×1.5 m", en: "e.g. 8×4×1.5 m" },
            },
            {
              key: "oprema",
              kind: "chips",
              label: { sr: "Oprema bazena", en: "Pool equipment" },
              importance: "optional",
              options: [
                { value: "filtracija", label: { sr: "Filtracija (pumpa + peščani filter)", en: "Filtration (pump + sand filter)" } },
                { value: "solarno_grejanje", label: { sr: "Solarno grejanje vode", en: "Solar water heating" } },
                { value: "toplotna_pumpa_bazen", label: { sr: "Toplotna pumpa za bazen", en: "Heat pump for pool" } },
                { value: "automatska_hemija", label: { sr: "Automatska dozirna stanica (hemija)", en: "Automatic chemical dosing" } },
                { value: "automatski_pokrivac", label: { sr: "Automatski pokrivač bazena", en: "Automatic pool cover" } },
                { value: "led_rasveta_bazen", label: { sr: "LED rasveta bazena", en: "Pool LED lighting" } },
              ],
            },
          ],
        },
      ],
    },

  ],
};
