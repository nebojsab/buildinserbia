import type { WizardProjectTree } from "./types";

export const izgradnjaTree: WizardProjectTree = {
  projectType: "newbuild",
  label: { sr: "Izgradnja", en: "New build" },
  categories: [

    // ─────────────────────────────────────────────────────────
    // 1. PROJEKTNA DOKUMENTACIJA
    // ─────────────────────────────────────────────────────────
    {
      id: "projektna_dok",
      label: { sr: "Projektna dokumentacija", en: "Design & permits" },
      icon: "file-text",
      subcategories: [
        {
          id: "dok_idejni",
          label: { sr: "Idejno rešenje / idejni projekat", en: "Concept design" },
          fields: [
            {
              key: "povrsina_objekta",
              kind: "area",
              label: { sr: "Planirana BRP (bruto razvijena površina)", en: "Planned GFA (gross floor area)" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250, 300],
              unknownAllowed: true,
            },
            {
              key: "broj_etaza",
              kind: "select",
              label: { sr: "Broj etaža", en: "Number of storeys" },
              importance: "required",
              options: [
                { value: "p", label: { sr: "Prizemlje (P)", en: "Ground floor only (G)" } },
                { value: "p1", label: { sr: "Prizemlje + 1 sprat (P+1)", en: "Ground + 1 (G+1)" } },
                { value: "p2", label: { sr: "Prizemlje + 2 sprata (P+2)", en: "Ground + 2 (G+2)" } },
                { value: "p_potkrovlje", label: { sr: "Prizemlje + potkrovlje (P+Pk)", en: "Ground + loft (G+Loft)" } },
                { value: "p1_potkrovlje", label: { sr: "P+1+Potkrovlje", en: "G+1+Loft" } },
                { value: "podrum_p", label: { sr: "Podrum + Prizemlje", en: "Basement + Ground" } },
                { value: "podrum_p1", label: { sr: "Podrum + P+1", en: "Basement + G+1" } },
              ],
            },
            {
              key: "tip_objekta",
              kind: "select",
              label: { sr: "Tip objekta", en: "Building type" },
              importance: "required",
              options: [
                { value: "porodicna_kuca", label: { sr: "Porodična kuća", en: "Detached house" } },
                { value: "dvojna_kuca", label: { sr: "Dvojna kuća (polu-slobodnostojeća)", en: "Semi-detached house" } },
                { value: "vikendica", label: { sr: "Vikendica", en: "Holiday cottage" } },
                { value: "stambeno_poslovni", label: { sr: "Stambeno-poslovni objekat", en: "Mixed-use (residential + commercial)" } },
                { value: "poslovni", label: { sr: "Poslovni objekat", en: "Commercial building" } },
              ],
            },
            {
              key: "arhitekta_postoji",
              kind: "toggle",
              label: { sr: "Već imam arhitektu / projektanta", en: "I already have an architect" },
              importance: "required",
            },
          ],
        },
        {
          id: "dok_gradevinska_dozvola",
          label: { sr: "Građevinska dozvola i odobrenja", en: "Building permit & approvals" },
          fields: [
            {
              key: "faza",
              kind: "select",
              label: { sr: "Trenutna faza", en: "Current stage" },
              importance: "required",
              options: [
                { value: "nije_poceto", label: { sr: "Nije početo — treba sve od početka", en: "Not started — need everything from scratch" } },
                { value: "parcela_uredjena", label: { sr: "Parcela uređena, nema dozvole", en: "Plot ready, no permit yet" } },
                { value: "lokacijski_uslovi", label: { sr: "Imam lokacijske uslove", en: "Have location conditions" } },
                { value: "projekat_spreman", label: { sr: "Projekat spreman, čekam dozvolu", en: "Plans ready, awaiting permit" } },
                { value: "dozvola_dobijena", label: { sr: "Dozvola dobijena", en: "Permit already obtained" } },
              ],
            },
            {
              key: "rgz_snimak",
              kind: "toggle",
              label: { sr: "Potreban geodetski snimak parcele (RGZ)", en: "Cadastral survey required (RGZ)" },
              importance: "optional",
            },
            {
              key: "priključci_komunalni",
              kind: "chips",
              label: { sr: "Komunalni priključci koje treba urediti", en: "Utility connections to arrange" },
              importance: "optional",
              options: [
                { value: "struja", label: { sr: "Struja (EPS/elektrodistribucija)", en: "Electricity" } },
                { value: "voda", label: { sr: "Vodovod (JKP)", en: "Water supply" } },
                { value: "kanalizacija", label: { sr: "Kanalizacija (JKP)", en: "Sewage" } },
                { value: "gas", label: { sr: "Gas (Srbijagas / lokalni distributer)", en: "Gas" } },
                { value: "telekomunikacije", label: { sr: "Telekomunikacije (optika)", en: "Telecommunications (fibre)" } },
              ],
            },
          ],
          estimateNotes: {
            sr: "Takse za dozvole variraju po opštini — AI agent će dati konkretne linkove za vašu lokaciju.",
            en: "Permit fees vary by municipality — AI agent will provide specific links for your location.",
          },
        },
        {
          id: "dok_izvodjacki",
          label: { sr: "Izvođački projekat (PGP)", en: "Construction drawings (tender package)" },
          fields: [
            {
              key: "struke",
              kind: "chips",
              label: { sr: "Potrebne struke u projektu", en: "Required disciplines" },
              importance: "required",
              options: [
                { value: "arhitektura", label: { sr: "Arhitektura", en: "Architecture" } },
                { value: "konstrukcija", label: { sr: "Konstrukcija (statika)", en: "Structural engineering" } },
                { value: "elektro", label: { sr: "Elektroinženjering", en: "Electrical engineering" } },
                { value: "masinski_vik", label: { sr: "Mašinske instalacije (ViK, grejanje)", en: "Mechanical (plumbing, heating)" } },
                { value: "protivpozarni", label: { sr: "Protivpožarni projekat", en: "Fire protection" } },
                { value: "energetski_pasos", label: { sr: "Elaborat o energetskim svojstvima", en: "Energy performance report" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 2. TEMELJI I ISKOP
    // ─────────────────────────────────────────────────────────
    {
      id: "temelji_iskop",
      label: { sr: "Temelji i iskop", en: "Foundations & excavation" },
      icon: "layers",
      subcategories: [
        {
          id: "iskop",
          label: { sr: "Mašinski iskop", en: "Mechanical excavation" },
          fields: [
            {
              key: "povrsina_iskopa",
              kind: "area",
              label: { sr: "Površina iskopa", en: "Excavation area" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "dubina_iskopa",
              kind: "select",
              label: { sr: "Dubina iskopa", en: "Excavation depth" },
              importance: "required",
              options: [
                { value: "do_1m", label: { sr: "Do 1 m (plitki temelji)", en: "Up to 1 m (shallow foundations)" } },
                { value: "1_2m", label: { sr: "1–2 m (temelji sa podrumom)", en: "1–2 m (with basement)" } },
                { value: "2_3m", label: { sr: "2–3 m (potpuno ukopan podrum)", en: "2–3 m (full basement)" } },
                { value: "vise_od_3m", label: { sr: "Više od 3 m", en: "More than 3 m" } },
              ],
            },
            {
              key: "tip_tla",
              kind: "select",
              label: { sr: "Tip tla (okvirno)", en: "Soil type (approx)" },
              importance: "optional",
              options: [
                { value: "zemlja_glinasta", label: { sr: "Zemlja / glina (normalan iskop)", en: "Earth / clay (standard dig)" } },
                { value: "pesak_sljunak", label: { sr: "Pesak / šljunak", en: "Sand / gravel" } },
                { value: "kamen_stena", label: { sr: "Kamen / stena (otežan iskop)", en: "Rock (difficult excavation)" } },
              ],
            },
            {
              key: "odvoz_zemlje",
              kind: "toggle",
              label: { sr: "Odvoz iskopane zemlje", en: "Removal of excavated spoil" },
              importance: "required",
            },
          ],
        },
        {
          id: "temelji_temeljne_trake",
          label: { sr: "Temeljne trake / temeljne ploče", en: "Strip foundations / raft foundations" },
          fields: [
            {
              key: "tip_temelja",
              kind: "select",
              label: { sr: "Tip temelja", en: "Foundation type" },
              importance: "required",
              options: [
                { value: "temeljne_trake", label: { sr: "Temeljne trake (armirani beton)", en: "Strip foundations (reinforced concrete)" } },
                { value: "temeljna_ploca", label: { sr: "Temeljna ploča (armirani beton)", en: "Raft foundation (reinforced concrete)" } },
                { value: "stubovi_samci", label: { sr: "Stupni temelji / samci", en: "Pad foundations / isolated footings" } },
                { value: "sipovi", label: { sr: "Šipovi (za loše tlo)", en: "Piles (for poor ground)" } },
              ],
            },
            {
              key: "kubatura_betona",
              kind: "number",
              label: { sr: "Okvirna kubatura betona (m³)", en: "Approx. concrete volume (m³)" },
              importance: "optional",
              unit: "m³",
              predefined: [10, 20, 30, 50, 80],
              unknownAllowed: true,
            },
            {
              key: "hidroizolacija_temelja",
              kind: "toggle",
              label: { sr: "Hidroizolacija temelja", en: "Foundation waterproofing" },
              importance: "required",
            },
            {
              key: "drenaza",
              kind: "toggle",
              label: { sr: "Drenažni sistem oko temelja", en: "Perimeter drainage system" },
              importance: "optional",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 3. KONSTRUKTIVNI SISTEM
    // ─────────────────────────────────────────────────────────
    {
      id: "konstrukcija",
      label: { sr: "Konstruktivni sistem", en: "Structural system" },
      icon: "building",
      subcategories: [
        {
          id: "konstrukcija_zidanje",
          label: { sr: "Zidanje (nosivi i pregradni zidovi)", en: "Masonry (load-bearing & partition walls)" },
          fields: [
            {
              key: "materijal_nosivi",
              kind: "select",
              label: { sr: "Materijal nosivih zidova", en: "Load-bearing wall material" },
              importance: "required",
              options: [
                { value: "blok_termo", label: { sr: "Termo blok (poroton / siporex)", en: "Thermal block (AAC / Poroton)" } },
                { value: "opeka_puna", label: { sr: "Puna opeka", en: "Solid brick" } },
                { value: "opeka_suplja", label: { sr: "Šuplja blok opeka", en: "Hollow brick block" } },
                { value: "ab_okvir_zidanje", label: { sr: "AB skelet + ispuna (blok / knauf)", en: "RC frame + infill (block / Knauf)" } },
              ],
            },
            {
              key: "debljina_nosivog_zida",
              kind: "select",
              label: { sr: "Debljina nosivih zidova", en: "Load-bearing wall thickness" },
              importance: "optional",
              options: [
                { value: "20cm", label: { sr: "20 cm", en: "20 cm" } },
                { value: "25cm", label: { sr: "25 cm", en: "25 cm" } },
                { value: "30cm", label: { sr: "30 cm", en: "30 cm" } },
                { value: "38cm", label: { sr: "38 cm", en: "38 cm" } },
              ],
            },
            {
              key: "povrsina_objekta",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "materijal_pregradni",
              kind: "select",
              label: { sr: "Pregradni zidovi", en: "Partition walls" },
              importance: "optional",
              options: [
                { value: "blok_10cm", label: { sr: "Blok 10 cm", en: "10 cm block" } },
                { value: "gipskarton", label: { sr: "Gips-karton (suvomontaža)", en: "Plasterboard (drylining)" } },
                { value: "opeka_pregradna", label: { sr: "Pregradna opeka", en: "Partition brick" } },
              ],
            },
          ],
        },
        {
          id: "konstrukcija_ploce",
          label: { sr: "Armiranobetonske ploče (međuspratne)", en: "Reinforced concrete slabs (intermediate floors)" },
          fields: [
            {
              key: "tip_ploce",
              kind: "select",
              label: { sr: "Tip ploče", en: "Slab type" },
              importance: "required",
              options: [
                { value: "monolitna_ab", label: { sr: "Monolitna AB ploča (lice u lice)", en: "Monolithic RC slab (cast in situ)" } },
                { value: "prednapregnuta", label: { sr: "Prednapregnutu šupljikave ploče (fert-beton)", en: "Prestressed hollow-core planks" } },
                { value: "ab_rebricasta", label: { sr: "AB rebrasta ploča (Fert sistem)", en: "RC ribbed slab (Fert system)" } },
              ],
            },
            {
              key: "povrsina_ploce",
              kind: "area",
              label: { sr: "Površina ploče (po etaži)", en: "Slab area (per floor)" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "broj_ploca",
              kind: "number",
              label: { sr: "Broj međuspratnih ploča", en: "Number of intermediate slabs" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3],
              unknownAllowed: false,
            },
          ],
        },
        {
          id: "konstrukcija_stepenice",
          label: { sr: "Stepenice", en: "Stairs" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip stepenica", en: "Stair type" },
              importance: "required",
              options: [
                { value: "ab_monolitne", label: { sr: "AB monolitne (u sklopu konstrukcije)", en: "Monolithic RC (in-situ)" } },
                { value: "celicne", label: { sr: "Čelična konstrukcija (metalne)", en: "Steel structure" } },
                { value: "drvene", label: { sr: "Drvene stepenice", en: "Timber stairs" } },
                { value: "staklene_celicne", label: { sr: "Staklene / čelične (dizajnerske)", en: "Glass / steel (designer)" } },
              ],
            },
            {
              key: "broj_etaza_koje_povezuje",
              kind: "number",
              label: { sr: "Broj etaža koje stepenice povezuju", en: "Number of floors connected" },
              importance: "required",
              unit: "etaže",
              predefined: [2, 3, 4],
              unknownAllowed: false,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 4. KROVNA KONSTRUKCIJA I POKRIVAČ
    // ─────────────────────────────────────────────────────────
    {
      id: "krov",
      label: { sr: "Krov", en: "Roof" },
      icon: "triangle",
      subcategories: [
        {
          id: "krov_konstrukcija",
          label: { sr: "Krovišna konstrukcija", en: "Roof structure (carpentry / steelwork)" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip krovišne konstrukcije", en: "Roof structure type" },
              importance: "required",
              options: [
                { value: "drvena_rogljaca", label: { sr: "Drvena rogljača (klasična)", en: "Traditional timber rafter roof" } },
                { value: "drvena_stolica", label: { sr: "Drvena stolica (sa grednicima)", en: "Timber truss roof (purlin)" } },
                { value: "celicna", label: { sr: "Čelična krovna konstrukcija", en: "Steel roof structure" } },
                { value: "ravni_krov_ab", label: { sr: "Ravni krov (AB ploča)", en: "Flat roof (RC slab)" } },
              ],
            },
            {
              key: "povrsina_krova",
              kind: "area",
              label: { sr: "Površina krova (kosa površina)", en: "Roof area (pitched surface)" },
              importance: "required",
              unit: "m²",
              predefined: [60, 80, 100, 130, 160, 200],
              unknownAllowed: true,
            },
            {
              key: "nagib",
              kind: "select",
              label: { sr: "Nagib krova", en: "Roof pitch" },
              importance: "optional",
              options: [
                { value: "blag_do15", label: { sr: "Blag (do 15°)", en: "Shallow (up to 15°)" } },
                { value: "srednji_15_30", label: { sr: "Srednji (15–30°)", en: "Medium (15–30°)" } },
                { value: "strmiji_30_45", label: { sr: "Strmiji (30–45°)", en: "Steep (30–45°)" } },
                { value: "strm_preko45", label: { sr: "Strm (> 45°)", en: "Very steep (> 45°)" } },
              ],
            },
          ],
        },
        {
          id: "krov_pokrivac",
          label: { sr: "Krovni pokrivač", en: "Roof covering" },
          fields: [
            {
              key: "pokrivac",
              kind: "select",
              label: { sr: "Tip pokrivača", en: "Covering type" },
              importance: "required",
              options: [
                { value: "crepe_glineni", label: { sr: "Glineni crep", en: "Clay tiles" } },
                { value: "crepe_betonski", label: { sr: "Betonski crep", en: "Concrete tiles" } },
                { value: "lim_trapezni", label: { sr: "Trapezni lim", en: "Trapezoidal metal sheet" } },
                { value: "lim_stojecafalc", label: { sr: "Stojeća falc (premium lim)", en: "Standing seam (premium metal)" } },
                { value: "bitumenske_sindrile", label: { sr: "Bitumenske šindre", en: "Bitumen shingles" } },
                { value: "ravni_krov_hidroizolacija", label: { sr: "Ravni krov — membrana / bitumen", en: "Flat roof — membrane / bitumen" } },
              ],
            },
            {
              key: "potkrovlje_izolacija",
              kind: "toggle",
              label: { sr: "Termoizolacija krovišta", en: "Roof thermal insulation" },
              importance: "required",
            },
            {
              key: "odvodni_sistemi",
              kind: "toggle",
              label: { sr: "Oluke i odvodne cevi", en: "Gutters and downpipes" },
              importance: "required",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 5. FASADA I SPOLJAŠNJA IZOLACIJA
    // ─────────────────────────────────────────────────────────
    {
      id: "fasada",
      label: { sr: "Fasada i spoljašnja izolacija", en: "Facade & external insulation" },
      icon: "home",
      subcategories: [
        {
          id: "fasada_etics",
          label: { sr: "Stiropor fasada (ETICS)", en: "EPS external wall insulation (ETICS)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade", en: "Facade area" },
              importance: "required",
              unit: "m²",
              predefined: [100, 150, 200, 250, 300, 400],
              unknownAllowed: true,
            },
            {
              key: "debljina",
              kind: "select",
              label: { sr: "Debljina stiropora", en: "EPS thickness" },
              importance: "required",
              options: [
                { value: "8cm", label: { sr: "8 cm", en: "8 cm" } },
                { value: "10cm", label: { sr: "10 cm (standard)", en: "10 cm (standard)" } },
                { value: "15cm", label: { sr: "15 cm (energetski pasoš B)", en: "15 cm (energy class B)" } },
                { value: "20cm", label: { sr: "20 cm (pasivni standard)", en: "20 cm (passive standard)" } },
              ],
            },
            {
              key: "zavrsni_sloj",
              kind: "select",
              label: { sr: "Završni sloj", en: "Finish coat" },
              importance: "required",
              options: [
                { value: "akrilni", label: { sr: "Akrilni malter (standard)", en: "Acrylic render (standard)" } },
                { value: "silikatni", label: { sr: "Silikatni malter (premium)", en: "Silicate render (premium)" } },
                { value: "silikonski", label: { sr: "Silikonski malter", en: "Silicone render" } },
                { value: "obloga_kamen", label: { sr: "Kamena obloga (delom)", en: "Stone cladding (partial)" } },
                { value: "klinkerne_opeke", label: { sr: "Klinkerne opeke (delom)", en: "Clinker bricks (partial)" } },
              ],
            },
          ],
        },
        {
          id: "fasada_malterisanje",
          label: { sr: "Spoljašnje malterisanje (bez izolacije)", en: "External rendering (without insulation)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade", en: "Facade area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 120, 160, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "tip_maltera",
              kind: "select",
              label: { sr: "Tip maltera", en: "Render type" },
              importance: "optional",
              options: [
                { value: "produzni_cementni", label: { sr: "Produžni cementni (klasični)", en: "Lime-cement render (classic)" } },
                { value: "fasadni_silikatni", label: { sr: "Fasadni silikatni (završni)", en: "Silicate finish render" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 6. SPOLJNA STOLARIJA
    // ─────────────────────────────────────────────────────────
    {
      id: "spoljna_stolarija",
      label: { sr: "Spoljna stolarija", en: "External joinery (windows & doors)" },
      icon: "door-open",
      subcategories: [
        {
          id: "stolarija_prozori",
          label: { sr: "Prozori i balkonska vrata", en: "Windows & balcony doors" },
          fields: [
            {
              key: "broj_prozora",
              kind: "number",
              label: { sr: "Broj prozora i balkonskih vrata", en: "Number of windows & balcony doors" },
              importance: "required",
              unit: "kom",
              predefined: [4, 6, 8, 10, 12, 15, 20],
              unknownAllowed: true,
            },
            {
              key: "ukupna_povrsina",
              kind: "area",
              label: { sr: "Ukupna površina ostakljenja", en: "Total glazed area" },
              importance: "optional",
              unit: "m²",
              unknownAllowed: true,
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
                { value: "drvo_aluminijum", label: { sr: "Drvo-aluminijum", en: "Wood-aluminium" } },
              ],
            },
            {
              key: "staklo",
              kind: "select",
              label: { sr: "Ostakljenje", en: "Glazing" },
              importance: "optional",
              options: [
                { value: "dvostuko", label: { sr: "Dvoslojno", en: "Double glazed" } },
                { value: "trojstuko", label: { sr: "Troslojno (za energetsku efikasnost)", en: "Triple glazed (energy efficient)" } },
              ],
            },
            {
              key: "roletne",
              kind: "toggle",
              label: { sr: "Roletne", en: "Roller shutters" },
              importance: "optional",
            },
          ],
        },
        {
          id: "stolarija_ulazna_vrata",
          label: { sr: "Ulazna vrata", en: "Entrance door" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip ulaznih vrata", en: "Entry door type" },
              importance: "required",
              options: [
                { value: "sigurnosna_celicna", label: { sr: "Sigurnosna čelična", en: "Steel security door" } },
                { value: "aluminijum", label: { sr: "Aluminijumska", en: "Aluminium" } },
                { value: "pvc", label: { sr: "PVC", en: "PVC" } },
                { value: "drvo", label: { sr: "Masivno drvo", en: "Solid wood" } },
              ],
            },
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj ulaznih vrata", en: "Number of entrance doors" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2],
              unknownAllowed: false,
            },
          ],
        },
        {
          id: "stolarija_garazna_vrata",
          label: { sr: "Garažna vrata", en: "Garage door" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip garažnih vrata", en: "Garage door type" },
              importance: "required",
              options: [
                { value: "sekcijska", label: { sr: "Sekcijska (uvlačeća)", en: "Sectional (overhead)" } },
                { value: "krilna", label: { sr: "Krilna (dupla)", en: "Side-hung (double leaf)" } },
                { value: "klizna", label: { sr: "Klizna", en: "Sliding" } },
              ],
            },
            {
              key: "motor",
              kind: "toggle",
              label: { sr: "Automatski pogon (motor)", en: "Automatic drive (motor)" },
              importance: "optional",
            },
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj garaža", en: "Number of garages" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2],
              unknownAllowed: false,
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 7. ELEKTROINSTALACIJE
    // ─────────────────────────────────────────────────────────
    {
      id: "elektroinstalacije",
      label: { sr: "Elektroinstalacije", en: "Electrical installations" },
      icon: "zap",
      subcategories: [
        {
          id: "elektro_kompletna",
          label: { sr: "Kompletna elektroinstalacija", en: "Full electrical installation" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "tip_razvodne_table",
              kind: "select",
              label: { sr: "Razvodna tabla", en: "Consumer unit" },
              importance: "optional",
              options: [
                { value: "standardna", label: { sr: "Standardna (jednofazna)", en: "Standard (single-phase)" } },
                { value: "trofazna", label: { sr: "Trofazna", en: "Three-phase" } },
              ],
            },
            {
              key: "smarthome_priprema",
              kind: "toggle",
              label: { sr: "Priprema infrastrukture za smart home", en: "Smart home cable infrastructure prep" },
              importance: "optional",
            },
            {
              key: "solarna_priprema",
              kind: "toggle",
              label: { sr: "Priprema za solarni sistem (kablovi do krova)", en: "Solar system cable prep (roof cables)" },
              importance: "optional",
            },
            {
              key: "punjac_ev",
              kind: "toggle",
              label: { sr: "Priprema za punjač EV vozila", en: "EV charger point prep" },
              importance: "optional",
            },
          ],
        },
        {
          id: "elektro_slaba_struja",
          label: { sr: "Slaba struja (IT, alarmni, AV sistemi)", en: "Low voltage (IT, alarm, AV systems)" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Sistemi", en: "Systems" },
              importance: "required",
              options: [
                { value: "mreza_it", label: { sr: "LAN mreža (Cat6/Cat7)", en: "LAN network (Cat6/Cat7)" } },
                { value: "alarm", label: { sr: "Alarmni sistem", en: "Burglar alarm" } },
                { value: "video_nadzor", label: { sr: "Video nadzor (CCTV)", en: "CCTV" } },
                { value: "interfonski", label: { sr: "Interfon / video portir", en: "Video intercom / door entry" } },
                { value: "audio_distribucija", label: { sr: "Audio distribucija", en: "AV distribution" } },
                { value: "tv_antena", label: { sr: "TV / SAT antenska instalacija", en: "TV / SAT aerial installation" } },
              ],
            },
          ],
        },
        {
          id: "elektro_solar",
          label: { sr: "Solarni sistem (fotonaponski)", en: "Solar PV system" },
          fields: [
            {
              key: "snaga_kwp",
              kind: "number",
              label: { sr: "Snaga sistema (kWp)", en: "System capacity (kWp)" },
              importance: "required",
              unit: "kWp",
              predefined: [3, 5, 6, 8, 10, 12, 15],
              unknownAllowed: true,
            },
            {
              key: "baterija",
              kind: "toggle",
              label: { sr: "Baterija za akumulaciju energije", en: "Battery storage" },
              importance: "optional",
            },
            {
              key: "on_off_grid",
              kind: "select",
              label: { sr: "Vrsta sistema", en: "System type" },
              importance: "optional",
              options: [
                { value: "on_grid", label: { sr: "On-grid (vezano za mrežu)", en: "On-grid (grid-tied)" } },
                { value: "hibridni", label: { sr: "Hibridni (mreža + baterija)", en: "Hybrid (grid + battery)" } },
                { value: "off_grid", label: { sr: "Off-grid (autonomni)", en: "Off-grid (autonomous)" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 8. VODOVODNE I KANALIZACIONE INSTALACIJE
    // ─────────────────────────────────────────────────────────
    {
      id: "vik_instalacije",
      label: { sr: "ViK instalacije", en: "Plumbing & drainage" },
      icon: "droplets",
      subcategories: [
        {
          id: "vik_kompletna",
          label: { sr: "Kompletna ViK instalacija", en: "Full plumbing & drainage installation" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "broj_kupatila",
              kind: "number",
              label: { sr: "Broj kupatila / WC-a", en: "Number of bathrooms / WCs" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
            {
              key: "materijal_cevi",
              kind: "select",
              label: { sr: "Materijal cevi", en: "Pipe material" },
              importance: "optional",
              options: [
                { value: "pex", label: { sr: "PEX (fleksibilne, preporučeno)", en: "PEX (flexible, recommended)" } },
                { value: "pp", label: { sr: "Polipropilen (PP)", en: "Polypropylene (PP)" } },
                { value: "bakar", label: { sr: "Bakar (premium)", en: "Copper (premium)" } },
              ],
            },
            {
              key: "septička_jama",
              kind: "toggle",
              label: { sr: "Septička jama / prečistač (ako nema javne kanalizacije)", en: "Septic tank / treatment (if no public sewer)" },
              importance: "optional",
            },
            {
              key: "cisterna_kisnicu",
              kind: "toggle",
              label: { sr: "Cisterna za kišnicu", en: "Rainwater harvesting tank" },
              importance: "optional",
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 9. GREJANJE I HLAĐENJE
    // ─────────────────────────────────────────────────────────
    {
      id: "grejanje_hladjenje",
      label: { sr: "Grejanje i hlađenje", en: "Heating & cooling" },
      icon: "flame",
      subcategories: [
        {
          id: "grejanje_kotao",
          label: { sr: "Kotao (centralno grejanje)", en: "Boiler (central heating)" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip kotla", en: "Boiler type" },
              importance: "required",
              options: [
                { value: "gas_kondenzacioni", label: { sr: "Gasni kondenzacioni", en: "Gas condensing" } },
                { value: "pelet", label: { sr: "Peletni", en: "Pellet" } },
                { value: "toplotna_pumpa", label: { sr: "Toplotna pumpa vazduh-voda", en: "Air-to-water heat pump" } },
                { value: "el_kotao", label: { sr: "Električni kotao", en: "Electric boiler" } },
                { value: "drva_ugalj", label: { sr: "Na drva/ugalj", en: "Wood/coal" } },
              ],
            },
            {
              key: "distribucija",
              kind: "select",
              label: { sr: "Distribucija toplote", en: "Heat distribution" },
              importance: "required",
              options: [
                { value: "radijatori", label: { sr: "Radijatori", en: "Radiators" } },
                { value: "podno_grejanje", label: { sr: "Podno grejanje", en: "Underfloor heating" } },
                { value: "kombinirano", label: { sr: "Kombinirano (radijatori + podno)", en: "Combined (radiators + UFH)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina za grejanje", en: "Heated area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "grejanje_klima",
          label: { sr: "Klima uređaji (split sistem)", en: "Air conditioning (split units)" },
          fields: [
            {
              key: "broj_unutrasnjih",
              kind: "number",
              label: { sr: "Broj unutrašnjih jedinica", en: "Number of indoor units" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6],
              unknownAllowed: true,
            },
            {
              key: "sistem",
              kind: "select",
              label: { sr: "Sistem", en: "System" },
              importance: "optional",
              options: [
                { value: "mono_split", label: { sr: "Mono-split jedince", en: "Individual mono-splits" } },
                { value: "multi_split", label: { sr: "Multi-split (jedna spoljna, više unutrašnjih)", en: "Multi-split (one outdoor, multiple indoor)" } },
                { value: "vrf_vrv", label: { sr: "VRF/VRV sistem (stambeno-poslovni)", en: "VRF/VRV (commercial-residential)" } },
              ],
            },
          ],
        },
        {
          id: "grejanje_rekuperacija",
          label: { sr: "Mehanička ventilacija s rekuperacijom (MVR)", en: "MVHR (mechanical ventilation with heat recovery)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 120, 150, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip sistema", en: "System type" },
              importance: "optional",
              options: [
                { value: "centralni", label: { sr: "Centralni (jedan uređaj, kanali)", en: "Central (one unit, ductwork)" } },
                { value: "decentralizovani", label: { sr: "Decentralizovani (po sobama)", en: "Decentralised (room units)" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 10. UNUTRAŠNJE ZAVRŠNE RADOVE
    // ─────────────────────────────────────────────────────────
    {
      id: "unutrasnje_zavrse",
      label: { sr: "Unutrašnje završne radove", en: "Internal fit-out & finishes" },
      icon: "paintbrush",
      subcategories: [
        {
          id: "zavrse_malterisanje",
          label: { sr: "Unutrašnje malterisanje i gletovanje", en: "Internal plastering & skim coating" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Ukupna površina zidova i plafona", en: "Total wall & ceiling area" },
              importance: "required",
              unit: "m²",
              predefined: [200, 300, 400, 500, 600, 800],
              unknownAllowed: true,
              help: {
                sr: "Gruba procena: BRP × 4 za prosečan stan/kuću.",
                en: "Quick estimate: GFA × 4 for an average house.",
              },
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip maltera", en: "Plaster type" },
              importance: "optional",
              options: [
                { value: "produzni_cementni", label: { sr: "Produžni cementni (klasični)", en: "Lime-cement (classic)" } },
                { value: "gips_masinski", label: { sr: "Mašinski gips malter (brži)", en: "Machine-applied gypsum plaster (faster)" } },
              ],
            },
          ],
        },
        {
          id: "zavrse_podovi",
          label: { sr: "Podovi", en: "Flooring" },
          fields: [
            {
              key: "raspodela",
              kind: "chips",
              label: { sr: "Tipovi podova po zonama", en: "Floor types by zone" },
              importance: "required",
              options: [
                { value: "parket_sobe", label: { sr: "Parket (sobe, dnevna)", en: "Parquet/hardwood (rooms, living)" } },
                { value: "keramika_kup_kuh", label: { sr: "Keramika (kupatilo, kuhinja, hodnik)", en: "Tiles (bathroom, kitchen, hall)" } },
                { value: "laminat", label: { sr: "Laminat", en: "Laminate" } },
                { value: "podno_grejanje_sve", label: { sr: "Sve površine podno grejanje", en: "All areas: underfloor heating" } },
              ],
            },
            {
              key: "povrsina_ukupna",
              kind: "area",
              label: { sr: "Ukupna površina podova", en: "Total floor area" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "zavrse_krecenje",
          label: { sr: "Krečenje i bojenje", en: "Painting & decorating" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina zidova i plafona", en: "Wall & ceiling area" },
              importance: "required",
              unit: "m²",
              predefined: [200, 300, 400, 500, 600, 800],
              unknownAllowed: true,
            },
            {
              key: "priprema",
              kind: "select",
              label: { sr: "Priprema površine", en: "Surface preparation" },
              importance: "required",
              options: [
                { value: "gletovanje_bojenje", label: { sr: "Gletovanje + bojenje (standard)", en: "Skim + paint (standard)" } },
                { value: "samo_bojenje", label: { sr: "Samo bojenje (površina glatka)", en: "Paint only (smooth surface)" } },
              ],
            },
          ],
        },
        {
          id: "zavrse_unutrasnja_stolarija",
          label: { sr: "Unutrašnja stolarija (vrata)", en: "Internal joinery (doors)" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj unutrašnjih vrata", en: "Number of internal doors" },
              importance: "required",
              unit: "kom",
              predefined: [4, 5, 6, 7, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip vrata", en: "Door style" },
              importance: "optional",
              options: [
                { value: "klasicna", label: { sr: "Klasična krilna", en: "Classic swing door" } },
                { value: "klizna", label: { sr: "Klizna (džepna)", en: "Sliding (pocket)" } },
                { value: "flush_laminat", label: { sr: "Plosnata (flush) — laminat", en: "Flush — laminate" } },
              ],
            },
          ],
        },
      ],
    },

  ],
};
