import type { WizardProjectTree } from "./types";

export const renovacijaTree: WizardProjectTree = {
  projectType: "reno",
  label: { sr: "Renovacija", en: "Renovation" },
  categories: [

    // ─────────────────────────────────────────────────────────
    // 1. KUPATILO
    // ─────────────────────────────────────────────────────────
    {
      id: "kupatilo",
      label: { sr: "Kupatilo", en: "Bathroom" },
      icon: "bath",
      subcategories: [
        {
          id: "kupatilo_kompletno",
          label: { sr: "Kompletna rekonstrukcija kupatila", en: "Full bathroom renovation" },
          description: {
            sr: "Demontaža svega, nova keramika, sanitarije, instalacije",
            en: "Full strip-out, new tiles, sanitary ware, plumbing",
          },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina kupatila", en: "Bathroom area" },
              importance: "required",
              unit: "m²",
              predefined: [3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "visina",
              kind: "number",
              label: { sr: "Visina prostorije", en: "Room height" },
              importance: "optional",
              unit: "m",
              predefined: [2.4, 2.6, 2.8, 3.0],
              unknownAllowed: true,
            },
            {
              key: "zamena_instalacija",
              kind: "toggle",
              label: { sr: "Zamena vodovodnih instalacija", en: "Replace plumbing pipes" },
              importance: "required",
            },
            {
              key: "zamena_elektrike",
              kind: "toggle",
              label: { sr: "Zamena električne instalacije", en: "Replace electrical wiring" },
              importance: "required",
            },
            {
              key: "sanitarije",
              kind: "chips",
              label: { sr: "Nova sanitarija", en: "New sanitary ware" },
              importance: "required",
              options: [
                { value: "wc", label: { sr: "WC šolja", en: "Toilet" } },
                { value: "lavabo", label: { sr: "Lavabo", en: "Sink" } },
                { value: "kada", label: { sr: "Kada", en: "Bathtub" } },
                { value: "tus_kabina", label: { sr: "Tuš kabina", en: "Shower cabin" } },
                { value: "tusna_pregrada", label: { sr: "Tušna pregrada (staklena)", en: "Shower screen" } },
                { value: "umivaonik_ormaric", label: { sr: "Ormarić ispod lavaba", en: "Vanity cabinet" } },
              ],
            },
            {
              key: "podno_grejanje",
              kind: "toggle",
              label: { sr: "Podno grejanje u kupatilu", en: "Underfloor heating" },
              importance: "optional",
            },
            {
              key: "ventilacija",
              kind: "toggle",
              label: { sr: "Mehanička ventilacija (aspirator)", en: "Mechanical ventilation (fan)" },
              importance: "optional",
            },
            {
              key: "napomena",
              kind: "text",
              label: { sr: "Napomena / posebni zahtevi", en: "Notes / special requirements" },
              importance: "niceToHave",
              placeholder: { sr: "npr. ugradnja jacuzzija, poseban raspored pločica...", en: "e.g. jacuzzi, custom tile layout..." },
            },
          ],
          estimateNotes: {
            sr: "Cena uključuje keramičarske radove, hidro-izolaciju, sanitarije i instalacije. Oprema (sanitarije, armature) nije uračunata u radove.",
            en: "Price includes tiling, waterproofing, sanitary work and plumbing. Fixtures and fittings are not included in labour estimate.",
          },
        },
        {
          id: "kupatilo_keramika",
          label: { sr: "Keramičarski radovi (bez demontaže)", en: "Tiling only (no strip-out)" },
          fields: [
            {
              key: "povrsina_poda",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area" },
              importance: "required",
              unit: "m²",
              predefined: [3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "povrsina_zidova",
              kind: "area",
              label: { sr: "Površina zidova za keramiku", en: "Wall tile area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30],
              unknownAllowed: true,
            },
            {
              key: "tip_keramike",
              kind: "select",
              label: { sr: "Tip pločica", en: "Tile type" },
              importance: "optional",
              options: [
                { value: "standard", label: { sr: "Standard (do 30x60)", en: "Standard (up to 30x60)" } },
                { value: "large_format", label: { sr: "Veliki format (60x60 i više)", en: "Large format (60x60+)" } },
                { value: "mozaik", label: { sr: "Mozaik", en: "Mosaic" } },
                { value: "kamen", label: { sr: "Prirodni kamen", en: "Natural stone" } },
              ],
            },
            {
              key: "hidroizolacija",
              kind: "toggle",
              label: { sr: "Ugradnja hidroizolacije pre keramike", en: "Waterproofing before tiling" },
              importance: "required",
            },
          ],
        },
        {
          id: "kupatilo_sanitarije",
          label: { sr: "Zamena sanitarija (bez keramike)", en: "Sanitary ware replacement only" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se menja", en: "Items to replace" },
              importance: "required",
              options: [
                { value: "wc", label: { sr: "WC šolja + vodokotlić", en: "Toilet + cistern" } },
                { value: "lavabo", label: { sr: "Lavabo + baterija", en: "Sink + tap" } },
                { value: "kada", label: { sr: "Kada + baterija", en: "Bathtub + tap" } },
                { value: "tus_kabina", label: { sr: "Tuš kabina", en: "Shower cabin" } },
                { value: "bojler", label: { sr: "Bojler", en: "Water heater" } },
              ],
            },
            {
              key: "ugradnja_bojlera_litara",
              kind: "select",
              label: { sr: "Zapremina bojlera", en: "Water heater capacity" },
              importance: "optional",
              options: [
                { value: "50", label: { sr: "50L", en: "50L" } },
                { value: "80", label: { sr: "80L", en: "80L" } },
                { value: "100", label: { sr: "100L", en: "100L" } },
                { value: "150", label: { sr: "150L", en: "150L" } },
              ],
              showWhen: { bojler: true },
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 2. PODOVI
    // ─────────────────────────────────────────────────────────
    {
      id: "podovi",
      label: { sr: "Podovi", en: "Flooring" },
      icon: "layers",
      subcategories: [
        {
          id: "podovi_parket",
          label: { sr: "Parket", en: "Hardwood flooring" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "vrsta_rada",
              kind: "select",
              label: { sr: "Vrsta rada", en: "Type of work" },
              importance: "required",
              options: [
                { value: "novo_postavljanje", label: { sr: "Postavljanje novog parketa", en: "Lay new flooring" } },
                { value: "brusenje_lakiranje", label: { sr: "Brušenje i lakiranje", en: "Sand and lacquer" } },
                { value: "reparatura", label: { sr: "Reparatura oštećenih dasaka", en: "Repair damaged boards" } },
              ],
            },
            {
              key: "tip_parketa",
              kind: "select",
              label: { sr: "Tip parketa", en: "Flooring type" },
              importance: "optional",
              options: [
                { value: "masivni", label: { sr: "Masivni parket", en: "Solid hardwood" } },
                { value: "troslojan", label: { sr: "Troslojan parket", en: "Engineered wood" } },
                { value: "bambus", label: { sr: "Bambus", en: "Bamboo" } },
              ],
              showWhen: { vrsta_rada: "novo_postavljanje" },
            },
            {
              key: "demontaza",
              kind: "toggle",
              label: { sr: "Demontaža starog poda", en: "Remove existing floor" },
              importance: "required",
              showWhen: { vrsta_rada: "novo_postavljanje" },
            },
            {
              key: "podloga",
              kind: "toggle",
              label: { sr: "Postavljanje podloge (estrih/nivelacija)", en: "Install screed / levelling" },
              importance: "optional",
              showWhen: { vrsta_rada: "novo_postavljanje" },
            },
          ],
        },
        {
          id: "podovi_laminat",
          label: { sr: "Laminat", en: "Laminate flooring" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "klasa",
              kind: "select",
              label: { sr: "Klasa otpornosti", en: "Wear resistance class" },
              importance: "optional",
              options: [
                { value: "ac3", label: { sr: "AC3 (stambeni, manji promet)", en: "AC3 (residential, low traffic)" } },
                { value: "ac4", label: { sr: "AC4 (stambeni, veći promet)", en: "AC4 (residential, high traffic)" } },
                { value: "ac5", label: { sr: "AC5 (komercijalni)", en: "AC5 (commercial)" } },
              ],
            },
            {
              key: "demontaza",
              kind: "toggle",
              label: { sr: "Demontaža starog poda", en: "Remove existing floor" },
              importance: "required",
            },
            {
              key: "lajsne",
              kind: "toggle",
              label: { sr: "Ugradnja lajsni", en: "Install skirting boards" },
              importance: "optional",
            },
          ],
        },
        {
          id: "podovi_keramika",
          label: { sr: "Keramičke pločice (podovi)", en: "Ceramic floor tiles" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 40, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "format",
              kind: "select",
              label: { sr: "Format pločica", en: "Tile format" },
              importance: "optional",
              options: [
                { value: "mali", label: { sr: "Mali format (do 30x30)", en: "Small (up to 30x30)" } },
                { value: "srednji", label: { sr: "Srednji (30x60, 45x45)", en: "Medium (30x60, 45x45)" } },
                { value: "veliki", label: { sr: "Veliki format (60x60, 80x80, 60x120)", en: "Large (60x60+)" } },
              ],
            },
            {
              key: "estrih",
              kind: "toggle",
              label: { sr: "Izrada estriha pre keramike", en: "Screed before tiling" },
              importance: "optional",
            },
            {
              key: "demontaza",
              kind: "toggle",
              label: { sr: "Demontaža starog poda", en: "Remove existing floor" },
              importance: "required",
            },
          ],
        },
        {
          id: "podovi_mikrocement",
          label: { sr: "Mikrocement / poliran beton", en: "Microcement / polished concrete" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80],
              unknownAllowed: true,
            },
            {
              key: "primena",
              kind: "chips",
              label: { sr: "Primena", en: "Application" },
              importance: "required",
              options: [
                { value: "pod", label: { sr: "Pod", en: "Floor" } },
                { value: "zid", label: { sr: "Zid", en: "Wall" } },
                { value: "stepenice", label: { sr: "Stepenice", en: "Stairs" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 3. ZIDOVI I PLAFONI
    // ─────────────────────────────────────────────────────────
    {
      id: "zidovi_plafoni",
      label: { sr: "Zidovi i plafoni", en: "Walls & Ceilings" },
      icon: "square",
      subcategories: [
        {
          id: "zidovi_krecenje",
          label: { sr: "Krečenje i bojenje", en: "Plastering & painting" },
          fields: [
            {
              key: "povrsina_zidova",
              kind: "area",
              label: { sr: "Površina zidova", en: "Wall area" },
              importance: "required",
              unit: "m²",
              predefined: [30, 50, 80, 100, 150, 200],
              unknownAllowed: true,
              help: {
                sr: "Ukupna površina svih zidova koje treba ličiti. Stan od 50m² ima ~180m² zidova.",
                en: "Total wall area to paint. A 50m² flat has ~180m² of walls.",
              },
            },
            {
              key: "povrsina_plafona",
              kind: "area",
              label: { sr: "Površina plafona", en: "Ceiling area" },
              importance: "optional",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "broj_slojeva",
              kind: "select",
              label: { sr: "Priprema površine", en: "Surface preparation" },
              importance: "required",
              options: [
                { value: "samo_boja", label: { sr: "Samo bojenje (površina u dobrom stanju)", en: "Paint only (surface in good condition)" } },
                { value: "gletovanje", label: { sr: "Gletovanje + bojenje", en: "Skim coat + paint" } },
                { value: "kompletna_priprema", label: { sr: "Kompletna priprema (skidanje starog, špajzanje, gletovanje)", en: "Full prep (strip, fill, skim)" } },
              ],
            },
            {
              key: "boja_tip",
              kind: "select",
              label: { sr: "Tip boje", en: "Paint type" },
              importance: "optional",
              options: [
                { value: "disperziona", label: { sr: "Disperziona (standard)", en: "Emulsion (standard)" } },
                { value: "silikatna", label: { sr: "Silikatna (premium, otpornija)", en: "Silicate (premium)" } },
                { value: "dekorativna", label: { sr: "Dekorativna efektna boja", en: "Decorative effect paint" } },
              ],
            },
          ],
        },
        {
          id: "zidovi_gipskarton",
          label: { sr: "Gips-karton (suvomontaža)", en: "Drylining / plasterboard" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "chips",
              label: { sr: "Vrsta radova", en: "Type of work" },
              importance: "required",
              options: [
                { value: "spusteni_plafon", label: { sr: "Spušteni plafon", en: "Suspended ceiling" } },
                { value: "pregradni_zid", label: { sr: "Pregradni zid", en: "Partition wall" } },
                { value: "obloga_zida", label: { sr: "Obloga zida / niša", en: "Wall cladding / niche" } },
                { value: "stepenicasti_plafon", label: { sr: "Stepenasti / ukrasni plafon", en: "Feature / stepped ceiling" } },
              ],
            },
            {
              key: "zvucna_izolacija",
              kind: "toggle",
              label: { sr: "Ugradnja zvučne izolacije", en: "Install acoustic insulation" },
              importance: "optional",
            },
            {
              key: "toplotna_izolacija",
              kind: "toggle",
              label: { sr: "Ugradnja toplotne izolacije", en: "Install thermal insulation" },
              importance: "optional",
            },
          ],
        },
        {
          id: "zidovi_dekorativni_malter",
          label: { sr: "Dekorativni malter / štukatura", en: "Decorative render / stucco" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [5, 10, 20, 30, 50],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip dekorativnog maltera", en: "Render type" },
              importance: "optional",
              options: [
                { value: "venecijaner", label: { sr: "Venecijaner", en: "Venetian plaster" } },
                { value: "marmorino", label: { sr: "Marmorino", en: "Marmorino" } },
                { value: "rustika", label: { sr: "Rustika / ribana fasadna", en: "Rustic render" } },
                { value: "mikrocement_zid", label: { sr: "Mikrocement na zidu", en: "Wall microcement" } },
              ],
            },
          ],
        },
        {
          id: "zidovi_tapete",
          label: { sr: "Tapetiranje", en: "Wallpapering" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80],
              unknownAllowed: true,
            },
            {
              key: "tip_tapete",
              kind: "select",
              label: { sr: "Tip tapete", en: "Wallpaper type" },
              importance: "optional",
              options: [
                { value: "papirna", label: { sr: "Papirna", en: "Paper" } },
                { value: "vinilna", label: { sr: "Vinilna (periva)", en: "Vinyl (washable)" } },
                { value: "flizelinska", label: { sr: "Flizelinska (non-woven)", en: "Non-woven" } },
                { value: "stakloplasticna", label: { sr: "Stakloplastična (strukturna)", en: "Fibreglass (textured)" } },
              ],
            },
            {
              key: "skidanje_starih",
              kind: "toggle",
              label: { sr: "Skidanje starih tapeta", en: "Remove existing wallpaper" },
              importance: "required",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 4. PROZORI I VRATA
    // ─────────────────────────────────────────────────────────
    {
      id: "prozori_vrata",
      label: { sr: "Prozori i vrata", en: "Windows & Doors" },
      icon: "door-open",
      subcategories: [
        {
          id: "prozori_zamena",
          label: { sr: "Zamena prozora", en: "Window replacement" },
          fields: [
            {
              key: "broj_prozora",
              kind: "number",
              label: { sr: "Broj prozora", en: "Number of windows" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "ukupna_povrsina",
              kind: "area",
              label: { sr: "Ukupna površina prozora (opciono)", en: "Total window area (optional)" },
              importance: "optional",
              unit: "m²",
              unknownAllowed: true,
              help: {
                sr: "Ako znate ukupnu m² prozora, preciznije računamo cenu.",
                en: "Providing total m² gives a more precise estimate.",
              },
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Frame material" },
              importance: "required",
              options: [
                { value: "pvc", label: { sr: "PVC", en: "PVC" } },
                { value: "aluminijum", label: { sr: "Aluminijum", en: "Aluminium" } },
                { value: "drvo", label: { sr: "Drvo", en: "Wood" } },
                { value: "drvo_aluminijum", label: { sr: "Drvo-aluminijum (Euro)", en: "Wood-aluminium (Euro)" } },
              ],
            },
            {
              key: "staklo",
              kind: "select",
              label: { sr: "Tip ostakljenja", en: "Glazing type" },
              importance: "optional",
              options: [
                { value: "dvostuko", label: { sr: "Dvoslojno (4-16-4)", en: "Double glazed (4-16-4)" } },
                { value: "trojstuko", label: { sr: "Troslojno (premium)", en: "Triple glazed (premium)" } },
              ],
            },
            {
              key: "roletne",
              kind: "toggle",
              label: { sr: "Ugradnja roletni", en: "Install roller shutters" },
              importance: "optional",
            },
            {
              key: "komarnici",
              kind: "toggle",
              label: { sr: "Komarnici", en: "Fly screens" },
              importance: "optional",
            },
            {
              key: "demontaza_starih",
              kind: "toggle",
              label: { sr: "Demontaža i odvoz starih prozora", en: "Remove and dispose of old windows" },
              importance: "required",
            },
          ],
          estimateNotes: {
            sr: "Cena je bez cene stolarije — samo ugradnja i obzide. Cena stolarije zavisi od dobavljača.",
            en: "Labour only — window units priced separately by supplier.",
          },
        },
        {
          id: "vrata_unutrasnja",
          label: { sr: "Unutrašnja vrata", en: "Interior doors" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj vrata", en: "Number of doors" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6, 8],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip vrata", en: "Door type" },
              importance: "optional",
              options: [
                { value: "klasicna", label: { sr: "Klasična (krilna)", en: "Swing door" } },
                { value: "klizna", label: { sr: "Klizna (džepna)", en: "Sliding / pocket door" } },
                { value: "plocastokrilna", label: { sr: "Plosnata (flush)", en: "Flush door" } },
              ],
            },
            {
              key: "ugradnja_stelaze",
              kind: "toggle",
              label: { sr: "Montaža štelaze (podešavanje krilnog okvira)", en: "Adjust/install door frame" },
              importance: "optional",
            },
            {
              key: "zidanje_otvora",
              kind: "toggle",
              label: { sr: "Izmena otvora (zidarski radovi)", en: "Modify wall opening (masonry work)" },
              importance: "optional",
            },
          ],
        },
        {
          id: "vrata_ulazna",
          label: { sr: "Ulazna vrata", en: "Entrance / security door" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj vrata", en: "Number of doors" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2],
              unknownAllowed: false,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip ulaznih vrata", en: "Entry door type" },
              importance: "required",
              options: [
                { value: "sigurnosna_celicna", label: { sr: "Sigurnosna čelična", en: "Steel security door" } },
                { value: "pvc", label: { sr: "PVC ulazna", en: "PVC entry door" } },
                { value: "aluminijum", label: { sr: "Aluminijumska", en: "Aluminium entry door" } },
                { value: "drvo_masivno", label: { sr: "Masivno drvo", en: "Solid wood" } },
              ],
            },
            {
              key: "montaza_interfona",
              kind: "toggle",
              label: { sr: "Ugradnja video interfona", en: "Install video intercom" },
              importance: "optional",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 5. ELEKTRIKA
    // ─────────────────────────────────────────────────────────
    {
      id: "elektrika",
      label: { sr: "Elektrika", en: "Electrical" },
      icon: "zap",
      subcategories: [
        {
          id: "elektrika_kompletna",
          label: { sr: "Kompletna zamena elektroinstalacije", en: "Full electrical rewiring" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina objekta", en: "Floor area" },
              importance: "required",
              unit: "m²",
              predefined: [30, 40, 50, 60, 80, 100, 120, 150],
              unknownAllowed: true,
            },
            {
              key: "broj_soba",
              kind: "number",
              label: { sr: "Broj prostorija", en: "Number of rooms" },
              importance: "optional",
              unit: "kom",
              predefined: [2, 3, 4, 5, 6],
              unknownAllowed: true,
            },
            {
              key: "razvodna_tabla",
              kind: "toggle",
              label: { sr: "Nova razvodna tabla (osigurači)", en: "New consumer unit (fuse board)" },
              importance: "required",
            },
            {
              key: "broj_strujnih_krugova",
              kind: "number",
              label: { sr: "Broj strujnih krugova (okvirno)", en: "Number of circuits (approx)" },
              importance: "optional",
              unit: "kom",
              predefined: [6, 8, 10, 12, 16],
              unknownAllowed: true,
            },
            {
              key: "ugradnja_kable_kanala",
              kind: "toggle",
              label: { sr: "Kablovi u kanale (vidljiva montaža)", en: "Surface-mounted cable trunking" },
              importance: "optional",
            },
          ],
          estimateNotes: {
            sr: "Cena ne uključuje sijalice, lusteri, roletne i slična potrošačka dobra.",
            en: "Excludes light fittings, appliances and consumer goods.",
          },
        },
        {
          id: "elektrika_delimicna",
          label: { sr: "Delimična zamena / dogradnja", en: "Partial rewiring / additions" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "utičnice_prekidači", label: { sr: "Utičnice i prekidači", en: "Sockets & switches" } },
                { value: "rasvetni_krug", label: { sr: "Novi rasvetni krug", en: "New lighting circuit" } },
                { value: "kuhinja_krug", label: { sr: "Kuhinja (poseban krug za šporet/rernu)", en: "Kitchen circuit (hob/oven)" } },
                { value: "kupatilo_krug", label: { sr: "Kupatilo (poseban krug)", en: "Bathroom circuit" } },
                { value: "spoljna_rasveta", label: { sr: "Spoljna rasveta", en: "Outdoor lighting" } },
              ],
            },
            {
              key: "broj_tackastih_radova",
              kind: "number",
              label: { sr: "Okvirni broj tačaka (utičnice + osvetljenje)", en: "Approx. number of points (sockets + lights)" },
              importance: "optional",
              unit: "kom",
              predefined: [5, 10, 15, 20, 30],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "elektrika_klima",
          label: { sr: "Ugradnja klima uređaja (split sistem)", en: "Air conditioning installation (split unit)" },
          fields: [
            {
              key: "broj_jedinica",
              kind: "number",
              label: { sr: "Broj unutrašnjih jedinica", en: "Number of indoor units" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
            {
              key: "tip_sistema",
              kind: "select",
              label: { sr: "Tip sistema", en: "System type" },
              importance: "optional",
              options: [
                { value: "mono_split", label: { sr: "Mono-split (1 spoljna + 1 unutrašnja)", en: "Mono-split (1 outdoor + 1 indoor)" } },
                { value: "multi_split", label: { sr: "Multi-split (1 spoljna + više unutrašnjih)", en: "Multi-split (1 outdoor + multiple indoor)" } },
              ],
            },
            {
              key: "prohodnost_fasade",
              kind: "toggle",
              label: { sr: "Bušenje fasade (spoljna instalacija)", en: "Facade penetration (outdoor unit)" },
              importance: "required",
            },
          ],
        },
        {
          id: "elektrika_smarthome",
          label: { sr: "Pametna kuća (Smart home)", en: "Smart home automation" },
          fields: [
            {
              key: "obim",
              kind: "chips",
              label: { sr: "Šta se automatizuje", en: "Automation scope" },
              importance: "required",
              options: [
                { value: "osvetljenje", label: { sr: "Pametno osvetljenje", en: "Smart lighting" } },
                { value: "termostati", label: { sr: "Pametni termostati", en: "Smart thermostats" } },
                { value: "roletne_motori", label: { sr: "Motorizovane roletne", en: "Motorised blinds/shutters" } },
                { value: "alarm", label: { sr: "Alarm i sigurnost", en: "Alarm & security" } },
                { value: "kamere", label: { sr: "Nadzorne kamere", en: "CCTV cameras" } },
                { value: "audio_video", label: { sr: "Audio/video distribucija", en: "AV distribution" } },
              ],
            },
            {
              key: "sistem",
              kind: "select",
              label: { sr: "Platforma", en: "Platform" },
              importance: "optional",
              options: [
                { value: "knx", label: { sr: "KNX (industrijski standard)", en: "KNX (industry standard)" } },
                { value: "zigbee_wifi", label: { sr: "Zigbee/WiFi (Tuya, Home Assistant...)", en: "Zigbee/WiFi (Tuya, Home Assistant...)" } },
                { value: "nije_odluceno", label: { sr: "Nije još odlučeno", en: "Not decided yet" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 6. VODOVODNE INSTALACIJE
    // ─────────────────────────────────────────────────────────
    {
      id: "vodovodne_instalacije",
      label: { sr: "Vodovodne instalacije", en: "Plumbing" },
      icon: "droplets",
      subcategories: [
        {
          id: "vodovod_kompletna_zamena",
          label: { sr: "Kompletna zamena cevi", en: "Full pipe replacement" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina objekta", en: "Floor area" },
              importance: "required",
              unit: "m²",
              predefined: [30, 40, 50, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "materijal_cevi",
              kind: "select",
              label: { sr: "Materijal novih cevi", en: "New pipe material" },
              importance: "optional",
              options: [
                { value: "pex", label: { sr: "PEX (fleksibilne)", en: "PEX (flexible)" } },
                { value: "polipropilen", label: { sr: "Polipropilen (PP)", en: "Polypropylene (PP)" } },
                { value: "bakar", label: { sr: "Bakar (premium)", en: "Copper (premium)" } },
              ],
            },
            {
              key: "broj_kupatila",
              kind: "number",
              label: { sr: "Broj kupatila / WC-a", en: "Number of bathrooms / WCs" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3],
              unknownAllowed: false,
            },
            {
              key: "kuhinja",
              kind: "toggle",
              label: { sr: "Priključak kuhinje", en: "Kitchen connection" },
              importance: "required",
            },
            {
              key: "podni_sifon",
              kind: "toggle",
              label: { sr: "Ugradnja podnih sifona", en: "Install floor drains" },
              importance: "optional",
            },
          ],
        },
        {
          id: "vodovod_delimicna",
          label: { sr: "Delimična izmena / priključci", en: "Partial changes / new connections" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "novi_kupatilski_prikljucak", label: { sr: "Novi kupatilski priključak", en: "New bathroom connection" } },
                { value: "novi_kuhinjski_prikljucak", label: { sr: "Novi kuhinjski priključak", en: "New kitchen connection" } },
                { value: "zamena_sifona_odvodnih", label: { sr: "Zamena sifona i odvodnih cevi", en: "Replace traps and drain pipes" } },
                { value: "preseljenje_wc", label: { sr: "Preseljenje WC šolje", en: "Relocate toilet" } },
              ],
            },
          ],
        },
        {
          id: "vodovod_bojler",
          label: { sr: "Ugradnja / zamena bojlera", en: "Water heater install / replacement" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip grejača vode", en: "Water heater type" },
              importance: "required",
              options: [
                { value: "el_akumulacioni", label: { sr: "Električni akumulacioni (bojler)", en: "Electric storage heater" } },
                { value: "protočni_el", label: { sr: "Električni protočni", en: "Electric instant heater" } },
                { value: "gas_kombini", label: { sr: "Gasni kombinovani kotao", en: "Gas combi boiler" } },
                { value: "toplotna_pumpa_bwt", label: { sr: "Toplotna pumpa za sanitarnu vodu", en: "Heat pump water heater" } },
              ],
            },
            {
              key: "zapremina",
              kind: "select",
              label: { sr: "Zapremina (za akumulacione)", en: "Capacity (storage heaters)" },
              importance: "optional",
              options: [
                { value: "50", label: { sr: "50L", en: "50L" } },
                { value: "80", label: { sr: "80L", en: "80L" } },
                { value: "100", label: { sr: "100L", en: "100L" } },
                { value: "150", label: { sr: "150L", en: "150L" } },
                { value: "200", label: { sr: "200L", en: "200L" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 7. GREJANJE
    // ─────────────────────────────────────────────────────────
    {
      id: "grejanje",
      label: { sr: "Grejanje", en: "Heating" },
      icon: "flame",
      subcategories: [
        {
          id: "grejanje_kotao",
          label: { sr: "Ugradnja / zamena kotla", en: "Boiler install / replacement" },
          fields: [
            {
              key: "tip_kotla",
              kind: "select",
              label: { sr: "Tip kotla", en: "Boiler type" },
              importance: "required",
              options: [
                { value: "gas_kondenzacioni", label: { sr: "Gasni kondenzacioni (najefikasniji)", en: "Gas condensing (most efficient)" } },
                { value: "gas_klasicni", label: { sr: "Gasni klasični", en: "Gas conventional" } },
                { value: "pelet", label: { sr: "Peletni kotao", en: "Pellet boiler" } },
                { value: "drva", label: { sr: "Na drva / ugalj", en: "Wood / coal" } },
                { value: "el_kotao", label: { sr: "Električni kotao", en: "Electric boiler" } },
                { value: "toplotna_pumpa", label: { sr: "Toplotna pumpa (vazduh-voda)", en: "Heat pump (air-to-water)" } },
              ],
            },
            {
              key: "snaga_kw",
              kind: "number",
              label: { sr: "Snaga kotla (kW)", en: "Boiler output (kW)" },
              importance: "optional",
              unit: "kW",
              predefined: [12, 18, 24, 28, 35, 45],
              unknownAllowed: true,
            },
            {
              key: "povrsina_za_grejanje",
              kind: "area",
              label: { sr: "Površina koja se greje", en: "Heated floor area" },
              importance: "required",
              unit: "m²",
              predefined: [50, 70, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "prikljucak_gasa",
              kind: "toggle",
              label: { sr: "Postoji priključak gasa", en: "Gas connection exists" },
              importance: "optional",
              showWhen: { tip_kotla: "gas_kondenzacioni" },
            },
            {
              key: "dimnjak",
              kind: "toggle",
              label: { sr: "Ugradnja dimnjaka / odvoda dimnih gasova", en: "Install flue / exhaust pipe" },
              importance: "optional",
            },
          ],
        },
        {
          id: "grejanje_radijatori",
          label: { sr: "Zamena / dodavanje radijatora", en: "Replace / add radiators" },
          fields: [
            {
              key: "broj_radijatora",
              kind: "number",
              label: { sr: "Broj radijatora", en: "Number of radiators" },
              importance: "required",
              unit: "kom",
              predefined: [2, 4, 6, 8, 10, 12],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip radijatora", en: "Radiator type" },
              importance: "optional",
              options: [
                { value: "celicni_plocasti", label: { sr: "Čelični pločasti (standard)", en: "Steel panel (standard)" } },
                { value: "aluminijumski", label: { sr: "Aluminijumski", en: "Aluminium" } },
                { value: "liveni", label: { sr: "Liveni (art-style)", en: "Cast iron (art-style)" } },
                { value: "cevni_kupatilski", label: { sr: "Cevni/kupatilski", en: "Towel rail / ladder" } },
              ],
            },
            {
              key: "zamena_ventila",
              kind: "toggle",
              label: { sr: "Ugradnja termostatskih ventila", en: "Install thermostatic valves (TRVs)" },
              importance: "optional",
            },
          ],
        },
        {
          id: "grejanje_podno",
          label: { sr: "Podno grejanje (toplovodni sistem)", en: "Underfloor heating (hydronic)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 50, 70, 100, 150],
              unknownAllowed: true,
            },
            {
              key: "zona",
              kind: "chips",
              label: { sr: "Prostorije", en: "Rooms" },
              importance: "optional",
              options: [
                { value: "dnevna", label: { sr: "Dnevna soba", en: "Living room" } },
                { value: "sobe", label: { sr: "Spavaće sobe", en: "Bedrooms" } },
                { value: "kupatilo", label: { sr: "Kupatilo", en: "Bathroom" } },
                { value: "hodnik", label: { sr: "Hodnik", en: "Hallway" } },
                { value: "kuhinja", label: { sr: "Kuhinja", en: "Kitchen" } },
                { value: "ceo_objekat", label: { sr: "Ceo objekat", en: "Whole property" } },
              ],
            },
            {
              key: "estrih",
              kind: "toggle",
              label: { sr: "Izrada estriha po montaži cevi", en: "Screed after pipe installation" },
              importance: "required",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 8. KUHINJA
    // ─────────────────────────────────────────────────────────
    {
      id: "kuhinja",
      label: { sr: "Kuhinja", en: "Kitchen" },
      icon: "utensils",
      subcategories: [
        {
          id: "kuhinja_namestaj",
          label: { sr: "Ugradna kuhinja (nameštaj)", en: "Fitted kitchen (furniture)" },
          fields: [
            {
              key: "duzina_kuhinjskog_bloka",
              kind: "length",
              label: { sr: "Dužina kuhinjskog bloka", en: "Kitchen run length" },
              importance: "required",
              unit: "m",
              predefined: [2, 2.4, 3, 3.6, 4, 4.8],
              unknownAllowed: true,
            },
            {
              key: "konfiguracija",
              kind: "select",
              label: { sr: "Konfiguracija", en: "Layout" },
              importance: "optional",
              options: [
                { value: "linearna", label: { sr: "Linearna (I-oblik)", en: "Linear (I-shape)" } },
                { value: "l_oblik", label: { sr: "L-oblik", en: "L-shape" } },
                { value: "u_oblik", label: { sr: "U-oblik", en: "U-shape" } },
                { value: "sa_ostrvom", label: { sr: "Sa ostrvom / polustrvom", en: "With island / peninsula" } },
              ],
            },
            {
              key: "materijal_frontova",
              kind: "select",
              label: { sr: "Materijal frontova", en: "Door / front material" },
              importance: "optional",
              options: [
                { value: "mdf_lakiran", label: { sr: "MDF lakirani", en: "MDF lacquered" } },
                { value: "furnirani", label: { sr: "Furnirani (drvo)", en: "Wood veneer" } },
                { value: "akrilni", label: { sr: "Akrilni (sjajni)", en: "Acrylic (high gloss)" } },
                { value: "laminatni", label: { sr: "Laminatni (HPL)", en: "Laminate (HPL)" } },
              ],
            },
            {
              key: "radna_ploca",
              kind: "select",
              label: { sr: "Radna ploča", en: "Worktop material" },
              importance: "optional",
              options: [
                { value: "postforming", label: { sr: "Postforming (laminat)", en: "Postforming (laminate)" } },
                { value: "granit_mermer", label: { sr: "Granit / mermer", en: "Granite / marble" } },
                { value: "kompozitni_kamen", label: { sr: "Kompozitni kamen (Silestone, Compac...)", en: "Engineered stone (Silestone, Compac...)" } },
                { value: "drvo_mesivno", label: { sr: "Masivno drvo", en: "Solid wood" } },
              ],
            },
            {
              key: "ugradnja_uredjaja",
              kind: "chips",
              label: { sr: "Ugradnja uređaja", en: "Appliance installation" },
              importance: "optional",
              options: [
                { value: "sporet_recno", label: { sr: "Rerni / ugradna rerma", en: "Oven (built-in)" } },
                { value: "ploce_za_kuvanje", label: { sr: "Ploče za kuvanje", en: "Hob" } },
                { value: "aspirator", label: { sr: "Aspirator / napa", en: "Extractor hood" } },
                { value: "masina_sudove", label: { sr: "Mašina za sudove", en: "Dishwasher" } },
                { value: "masina_ves", label: { sr: "Mašina za veš", en: "Washing machine" } },
                { value: "frizider", label: { sr: "Frižider (ugradni)", en: "Fridge (integrated)" } },
              ],
            },
          ],
        },
        {
          id: "kuhinja_keramika",
          label: { sr: "Keramika u kuhinji", en: "Kitchen tiling" },
          fields: [
            {
              key: "povrsina_poda",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area" },
              importance: "required",
              unit: "m²",
              predefined: [5, 8, 10, 12, 15, 20],
              unknownAllowed: true,
            },
            {
              key: "kecelja",
              kind: "toggle",
              label: { sr: "Kecelja (zid iza radne ploče)", en: "Splashback tiles (behind worktop)" },
              importance: "optional",
            },
            {
              key: "kecelja_duzina",
              kind: "length",
              label: { sr: "Dužina kecelje", en: "Splashback length" },
              importance: "optional",
              unit: "m",
              predefined: [1.5, 2, 2.4, 3, 3.6],
              unknownAllowed: true,
              showWhen: { kecelja: true },
            },
          ],
        },
        {
          id: "kuhinja_instalacije",
          label: { sr: "Instalacije za kuhinju (voda, struja, gas)", en: "Kitchen services (water, electrical, gas)" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "novi_vod_voda", label: { sr: "Novi vodovodnog priključak", en: "New water supply" } },
                { value: "novi_vod_kanal", label: { sr: "Novi kanalizacioni priključak", en: "New waste connection" } },
                { value: "novi_strujni_krug", label: { sr: "Poseban strujni krug za kuhinju", en: "Dedicated kitchen electrical circuit" } },
                { value: "gas_priključak", label: { sr: "Plinski priključak", en: "Gas supply connection" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 9. FASADA I IZOLACIJA
    // ─────────────────────────────────────────────────────────
    {
      id: "fasada_izolacija",
      label: { sr: "Fasada i izolacija", en: "Facade & Insulation" },
      icon: "home",
      subcategories: [
        {
          id: "fasada_stiropor",
          label: { sr: "Stiropor fasada (ETICS sistem)", en: "EPS external wall insulation (ETICS)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade", en: "Facade area" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 150, 200, 300],
              unknownAllowed: true,
            },
            {
              key: "debljina_stiropora",
              kind: "select",
              label: { sr: "Debljina stiropora", en: "EPS thickness" },
              importance: "required",
              options: [
                { value: "5cm", label: { sr: "5 cm", en: "5 cm" } },
                { value: "8cm", label: { sr: "8 cm", en: "8 cm" } },
                { value: "10cm", label: { sr: "10 cm (preporučeno)", en: "10 cm (recommended)" } },
                { value: "15cm", label: { sr: "15 cm (pasivni standard)", en: "15 cm (passive standard)" } },
                { value: "20cm", label: { sr: "20 cm", en: "20 cm" } },
              ],
            },
            {
              key: "skele",
              kind: "toggle",
              label: { sr: "Potrebno postavljanje skela", en: "Scaffolding required" },
              importance: "required",
            },
            {
              key: "demontaza_stare_fasade",
              kind: "toggle",
              label: { sr: "Demontaža stare fasade", en: "Remove existing facade" },
              importance: "optional",
            },
            {
              key: "tip_zavrsnog_maltera",
              kind: "select",
              label: { sr: "Završni sloj", en: "Finish coat" },
              importance: "optional",
              options: [
                { value: "silikatni", label: { sr: "Silikatni malter (otporan, premium)", en: "Silicate render (durable, premium)" } },
                { value: "silikonski", label: { sr: "Silikonski malter", en: "Silicone render" } },
                { value: "akrilni", label: { sr: "Akrilni malter (standard)", en: "Acrylic render (standard)" } },
                { value: "kamen_obloga", label: { sr: "Kamena obloga (delom)", en: "Stone cladding (partial)" } },
              ],
            },
          ],
          estimateNotes: {
            sr: "Cena uključuje sve radove i materijal ETICS sistema. Nije uključena cena skela ako su potrebne — to se posebno ceni.",
            en: "Price includes all ETICS materials and labour. Scaffolding estimated separately if required.",
          },
        },
        {
          id: "fasada_kamena_vuna",
          label: { sr: "Kamena/staklena vuna (fasada ili unutrašnjost)", en: "Rock/glass wool insulation (facade or interior)" },
          fields: [
            {
              key: "primena",
              kind: "select",
              label: { sr: "Primena", en: "Application" },
              importance: "required",
              options: [
                { value: "fasada_ventilisana", label: { sr: "Ventilisana fasada (oblaganje)", en: "Ventilated facade (cladding)" } },
                { value: "unutrasnji_zid", label: { sr: "Unutrašnji zid (sa gips-kartonom)", en: "Internal wall (with plasterboard)" } },
                { value: "medjuspratna_ploca", label: { sr: "Međuspratna ploča (pod/plafon)", en: "Intermediate slab (floor/ceiling)" } },
                { value: "krov_kosina", label: { sr: "Krov (kosa streha)", en: "Pitched roof" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 40, 60, 80, 100, 150],
              unknownAllowed: true,
            },
            {
              key: "debljina",
              kind: "select",
              label: { sr: "Debljina vune", en: "Wool thickness" },
              importance: "optional",
              options: [
                { value: "5cm", label: { sr: "5 cm", en: "5 cm" } },
                { value: "8cm", label: { sr: "8 cm", en: "8 cm" } },
                { value: "10cm", label: { sr: "10 cm", en: "10 cm" } },
                { value: "15cm", label: { sr: "15 cm", en: "15 cm" } },
              ],
            },
          ],
        },
        {
          id: "fasada_hidroizolacija",
          label: { sr: "Hidroizolacija (podrum, ravni krov, terasa)", en: "Waterproofing (basement, flat roof, terrace)" },
          fields: [
            {
              key: "tip_lokacije",
              kind: "chips",
              label: { sr: "Lokacija hidroizolacije", en: "Waterproofing location" },
              importance: "required",
              options: [
                { value: "podrum_temelj", label: { sr: "Podrum / temelj", en: "Basement / foundation" } },
                { value: "ravni_krov", label: { sr: "Ravni krov", en: "Flat roof" } },
                { value: "terasa_balkon", label: { sr: "Terasa / balkon", en: "Terrace / balcony" } },
                { value: "mokri_cvor", label: { sr: "Mokri čvor (kupatilo, kuhinja)", en: "Wet room (bathroom, kitchen)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Ukupna površina", en: "Total area" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "sistem",
              kind: "select",
              label: { sr: "Sistem hidroizolacije", en: "Waterproofing system" },
              importance: "optional",
              options: [
                { value: "bitumenska_traka", label: { sr: "Bitumenska traka (varenjem)", en: "Bituminous membrane (torch-on)" } },
                { value: "teckona_membrana", label: { sr: "Tečna membrana (premaz)", en: "Liquid applied membrane" } },
                { value: "bentonitske_ploce", label: { sr: "Bentonitske ploče (podrum)", en: "Bentonite panels (basement)" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 10. KROV
    // ─────────────────────────────────────────────────────────
    {
      id: "krov",
      label: { sr: "Krov", en: "Roof" },
      icon: "triangle",
      subcategories: [
        {
          id: "krov_zamena_pokrivaca",
          label: { sr: "Zamena krovnog pokrivača", en: "Roof covering replacement" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina krova (kosa)", en: "Roof area (pitched)" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 150, 200, 300],
              unknownAllowed: true,
            },
            {
              key: "stari_pokrivac",
              kind: "select",
              label: { sr: "Postojeći pokrivač", en: "Existing cover" },
              importance: "optional",
              options: [
                { value: "crepe", label: { sr: "Crep (glineni/betonski)", en: "Clay/concrete tiles" } },
                { value: "salonit", label: { sr: "Salonit / eternit", en: "Fibre cement / Eternit" } },
                { value: "lim", label: { sr: "Lim (pocinkovani/poliester)", en: "Metal sheet (galvanised/coated)" } },
                { value: "bitumenske_sindrile", label: { sr: "Bitumenske šindre", en: "Bitumen shingles" } },
              ],
            },
            {
              key: "novi_pokrivac",
              kind: "select",
              label: { sr: "Novi pokrivač", en: "New cover" },
              importance: "required",
              options: [
                { value: "crepe_glineni", label: { sr: "Glineni crep", en: "Clay tiles" } },
                { value: "crepe_betonski", label: { sr: "Betonski crep", en: "Concrete tiles" } },
                { value: "lim_trapezni", label: { sr: "Trapezni lim", en: "Trapezoidal metal sheet" } },
                { value: "lim_stojeca_falc", label: { sr: "Stojeća falc (premium lim)", en: "Standing seam (premium metal)" } },
                { value: "bitumenske_sindrile", label: { sr: "Bitumenske šindre", en: "Bitumen shingles" } },
                { value: "solarne_ploce_krov", label: { sr: "Solarne ploče (integrisane)", en: "Solar tiles (integrated)" } },
              ],
            },
            {
              key: "demontaza",
              kind: "toggle",
              label: { sr: "Demontaža i odvoz starog pokrivača", en: "Remove and dispose of old cover" },
              importance: "required",
            },
            {
              key: "podkrovlje_hidroizolacija",
              kind: "toggle",
              label: { sr: "Ugradnja podkrovne hidroizolacione folije", en: "Install roofing underlay membrane" },
              importance: "optional",
            },
          ],
        },
        {
          id: "krov_termoizolacija_potkrovlja",
          label: { sr: "Termoizolacija potkrovlja", en: "Loft / attic insulation" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Način izolacije", en: "Insulation method" },
              importance: "required",
              options: [
                { value: "izmedju_rogova", label: { sr: "Između rogova (kamena vuna + GK)", en: "Between rafters (rock wool + plasterboard)" } },
                { value: "pod_tavanicu", label: { sr: "Tavanica potkrovlja (ispuniti šljunkom / celulozom)", en: "Flat ceiling (loose fill / cellulose)" } },
                { value: "sprej_pena", label: { sr: "Sprej pena (PU foam)", en: "Spray foam (PU)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina potkrovlja", en: "Loft area" },
              importance: "required",
              unit: "m²",
              predefined: [30, 50, 80, 100, 150],
              unknownAllowed: true,
            },
            {
              key: "obloga",
              kind: "toggle",
              label: { sr: "Ugradnja gips-karton obloge", en: "Install plasterboard lining" },
              importance: "optional",
            },
          ],
        },
        {
          id: "krov_reparatura",
          label: { sr: "Reparatura / krpljenje krova", en: "Roof repair / patch" },
          fields: [
            {
              key: "opseg",
              kind: "select",
              label: { sr: "Obim oštećenja", en: "Damage extent" },
              importance: "required",
              options: [
                { value: "manje_od_10m2", label: { sr: "Manje oštećenje (< 10 m²)", en: "Minor damage (< 10 m²)" } },
                { value: "10_do_30m2", label: { sr: "Srednje (10–30 m²)", en: "Moderate (10–30 m²)" } },
                { value: "vise_od_30m2", label: { sr: "Veće oštećenje (> 30 m²) — preporučuje se kompletna zamena", en: "Significant (> 30 m²) — full replacement may be better" } },
              ],
            },
            {
              key: "uzrok",
              kind: "select",
              label: { sr: "Uzrok", en: "Cause" },
              importance: "optional",
              options: [
                { value: "pukli_crepovi", label: { sr: "Puknuti / pomereni crepovi", en: "Cracked / displaced tiles" } },
                { value: "oštećena_obloga", label: { sr: "Oštećena limena obloga", en: "Damaged flashing" } },
                { value: "truli_rogovi", label: { sr: "Truli rogovi / letva", en: "Rotten rafters / battens" } },
                { value: "prokišnjava", label: { sr: "Prokišnjava (nepoznat uzrok)", en: "Leaking (unknown cause)" } },
              ],
            },
            {
              key: "napomena",
              kind: "text",
              label: { sr: "Opis problema", en: "Problem description" },
              importance: "niceToHave",
              placeholder: { sr: "Opišite gde i kako prokišnjava, šta ste primetili...", en: "Describe where and how it leaks, what you've noticed..." },
            },
          ],
        },
      ],
    },

  ],
};
