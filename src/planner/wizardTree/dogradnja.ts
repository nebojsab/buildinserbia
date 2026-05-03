import type { WizardProjectTree } from "./types";

export const dogradnjaTree: WizardProjectTree = {
  projectType: "extension",
  label: { sr: "Dogradnja / nadogradnja", en: "Extension" },
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
          id: "dok_tip_dogradnje",
          label: { sr: "Tip dogradnje", en: "Extension type" },
          description: {
            sr: "Definiše koji projekat i dozvole su potrebni",
            en: "Determines which design and permits are required",
          },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Vrsta radova", en: "Type of works" },
              importance: "required",
              options: [
                { value: "dogradnja_horizont", label: { sr: "Horizontalna dogradnja (proširenje osnove)", en: "Horizontal extension (footprint expansion)" } },
                { value: "nadogradnja_sprat", label: { sr: "Vertikalna nadogradnja (novi sprat)", en: "Vertical extension (new storey)" } },
                { value: "adaptacija_potkrovlja", label: { sr: "Adaptacija potkrovlja u stambeni prostor", en: "Loft conversion (to habitable space)" } },
                { value: "adaptacija_podruma", label: { sr: "Adaptacija podruma u stambeni prostor", en: "Basement conversion (to habitable space)" } },
                { value: "prizemna_dogradnja", label: { sr: "Prizemna dogradnja (garaza, ostava, letnjakuhinja)", en: "Single-storey addition (garage, utility, summer kitchen)" } },
              ],
            },
            {
              key: "povrsina_dogradnje",
              kind: "area",
              label: { sr: "Planirana površina dogradnje", en: "Planned extension area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "postojeci_objekat_povrsina",
              kind: "area",
              label: { sr: "Površina postojećeg objekta", en: "Existing building area" },
              importance: "optional",
              unit: "m²",
              predefined: [50, 70, 100, 120, 150, 200],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "dok_dozvola",
          label: { sr: "Dozvole i odobrenja", en: "Permits & approvals" },
          fields: [
            {
              key: "faza",
              kind: "select",
              label: { sr: "Trenutna faza", en: "Current stage" },
              importance: "required",
              options: [
                { value: "nije_poceto", label: { sr: "Nije početo — treba projekat i dozvola", en: "Not started — need design and permit" } },
                { value: "projekat_spreman", label: { sr: "Projekat spreman, čekam dozvolu", en: "Plans ready, awaiting permit" } },
                { value: "dozvola_dobijena", label: { sr: "Dozvola dobijena", en: "Permit obtained" } },
              ],
            },
            {
              key: "vlasnistvo_uredeno",
              kind: "toggle",
              label: { sr: "Imovinsko-pravni odnosi uređeni (list nepokretnosti čist)", en: "Property rights clear (no encumbrances)" },
              importance: "required",
            },
            {
              key: "arhitekta_postoji",
              kind: "toggle",
              label: { sr: "Već imam arhitektu", en: "I already have an architect" },
              importance: "required",
            },
          ],
          estimateNotes: {
            sr: "Za dogradnju/nadogradnju potrebna je nova građevinska dozvola ili izmena i dopuna postojeće. AI agent daje lokacijske linkove.",
            en: "Extension requires a new building permit or amendment to existing. AI agent provides location-specific links.",
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 2. TEMELJI ZA DOGRADNJU
    // ─────────────────────────────────────────────────────────
    {
      id: "temelji",
      label: { sr: "Temelji za dogradnju", en: "Extension foundations" },
      icon: "layers",
      subcategories: [
        {
          id: "temelji_iskop",
          label: { sr: "Iskop i temelji (horizontalna dogradnja)", en: "Excavation & foundations (horizontal extension)" },
          fields: [
            {
              key: "povrsina_iskopa",
              kind: "area",
              label: { sr: "Površina iskopa", en: "Excavation area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "tip_temelja",
              kind: "select",
              label: { sr: "Tip temelja", en: "Foundation type" },
              importance: "required",
              options: [
                { value: "temeljne_trake", label: { sr: "Temeljne trake (armirani beton)", en: "Strip foundations (RC)" } },
                { value: "temeljna_ploca", label: { sr: "Temeljna ploča", en: "Raft foundation" } },
              ],
            },
            {
              key: "veza_sa_postojecim",
              kind: "select",
              label: { sr: "Veza sa postojećim temeljima", en: "Connection to existing foundations" },
              importance: "required",
              options: [
                { value: "dilatacija", label: { sr: "Dilatacija (odvojena konstrukcija)", en: "Expansion joint (separate structure)" } },
                { value: "vezivanje", label: { sr: "Vezivanje (monolitna veza)", en: "Tied in (monolithic connection)" } },
              ],
            },
            {
              key: "hidroizolacija",
              kind: "toggle",
              label: { sr: "Hidroizolacija temelja", en: "Foundation waterproofing" },
              importance: "required",
            },
          ],
        },
        {
          id: "temelji_ojacanje",
          label: { sr: "Ojačanje postojeće konstrukcije", en: "Strengthening existing structure" },
          description: {
            sr: "Potrebno za nadogradnju novog sprata na postojeći objekat",
            en: "Required when adding a new storey to an existing building",
          },
          fields: [
            {
              key: "geomehanicki_izvestaj",
              kind: "toggle",
              label: { sr: "Potreban geomehanički izveštaj tla", en: "Geotechnical survey required" },
              importance: "required",
            },
            {
              key: "staticka_analiza",
              kind: "toggle",
              label: { sr: "Statička analiza postojeće konstrukcije", en: "Structural analysis of existing building" },
              importance: "required",
            },
            {
              key: "intervencije",
              kind: "chips",
              label: { sr: "Predviđene intervencije", en: "Anticipated interventions" },
              importance: "optional",
              options: [
                { value: "injekcija_temelja", label: { sr: "Injektiranje temelja", en: "Foundation injection/underpinning" } },
                { value: "ab_serklas", label: { sr: "AB serklaž (venac za novu etažu)", en: "RC ring beam (for new storey)" } },
                { value: "ojacanje_zidova", label: { sr: "Ojačanje nosivih zidova", en: "Strengthening load-bearing walls" } },
                { value: "nova_ab_plocha", label: { sr: "Nova AB ploča kao temelj novog sprata", en: "New RC slab as base for new storey" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 3. KONSTRUKTIVNI SISTEM DOGRADNJE
    // ─────────────────────────────────────────────────────────
    {
      id: "konstrukcija",
      label: { sr: "Konstruktivni sistem dogradnje", en: "Extension structural system" },
      icon: "building",
      subcategories: [
        {
          id: "konstrukcija_zidanje",
          label: { sr: "Zidanje dogradnje", en: "Extension masonry" },
          fields: [
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal zidanja", en: "Wall material" },
              importance: "required",
              options: [
                { value: "blok_termo", label: { sr: "Termo blok (poroton / siporex)", en: "Thermal block (AAC / Poroton)" } },
                { value: "opeka", label: { sr: "Blok opeka", en: "Brick block" } },
                { value: "ab_prefabrikovano", label: { sr: "Prefabrikovani AB elementi", en: "Precast RC panels" } },
                { value: "drvena_konstrukcija", label: { sr: "Drvena skeletna konstrukcija", en: "Timber frame" } },
                { value: "celicna_sk", label: { sr: "Čelična skeletna konstrukcija", en: "Steel frame" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina dogradnje (tlocrt)", en: "Extension footprint area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "visina_etaze",
              kind: "select",
              label: { sr: "Visina etaže dogradnje", en: "Extension storey height" },
              importance: "optional",
              options: [
                { value: "240", label: { sr: "2.40 m (niska)", en: "2.40 m (low)" } },
                { value: "260", label: { sr: "2.60 m (standard)", en: "2.60 m (standard)" } },
                { value: "280", label: { sr: "2.80 m (viša)", en: "2.80 m (tall)" } },
                { value: "300", label: { sr: "3.00 m i više", en: "3.00 m and above" } },
              ],
            },
          ],
        },
        {
          id: "konstrukcija_krov_dogradnje",
          label: { sr: "Krov dogradnje", en: "Extension roof" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip krova dogradnje", en: "Extension roof type" },
              importance: "required",
              options: [
                { value: "ravni", label: { sr: "Ravni krov (monolit AB + membrana)", en: "Flat roof (RC slab + membrane)" } },
                { value: "jednovodan", label: { sr: "Jednovodni krov (shed roof)", en: "Mono-pitch (shed) roof" } },
                { value: "dvovodan", label: { sr: "Dvovodan krov (nastavak postojećeg)", en: "Dual-pitch roof (matching existing)" } },
                { value: "staklena_krovina", label: { sr: "Staklena krovina (svetlarnik)", en: "Glazed roof (rooflight / lantern)" } },
              ],
            },
            {
              key: "povrsina_krova",
              kind: "area",
              label: { sr: "Površina krova", en: "Roof area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "izolacija",
              kind: "toggle",
              label: { sr: "Termoizolacija krova/tavanice", en: "Roof/ceiling insulation" },
              importance: "required",
            },
          ],
        },
        {
          id: "konstrukcija_spajanje",
          label: { sr: "Spajanje sa postojećim objektom", en: "Connection to existing building" },
          fields: [
            {
              key: "probijanje_zida",
              kind: "toggle",
              label: { sr: "Probijanje zida (novo otvaranje prema dogradnji)", en: "Knock through (new opening to extension)" },
              importance: "required",
            },
            {
              key: "broj_otvora",
              kind: "number",
              label: { sr: "Broj novih otvora (vrata/prolaza)", en: "Number of new openings (doors / passageways)" },
              importance: "optional",
              unit: "kom",
              predefined: [1, 2, 3],
              unknownAllowed: false,
              showWhen: { probijanje_zida: true },
            },
            {
              key: "tip_nosaca_nad_otvorom",
              kind: "select",
              label: { sr: "Nadvratnik / greda nad otvorom", en: "Lintel / beam over opening" },
              importance: "optional",
              options: [
                { value: "ab_greda", label: { sr: "AB greda (monolitna)", en: "RC beam (in-situ)" } },
                { value: "celicna_greda", label: { sr: "Čelična greda (IPE profil)", en: "Steel beam (IPE profile)" } },
                { value: "prefabrikovani_nadvratnik", label: { sr: "Prefabrikovani nadvratnik", en: "Prefabricated lintel" } },
              ],
              showWhen: { probijanje_zida: true },
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 4. FASADA DOGRADNJE
    // ─────────────────────────────────────────────────────────
    {
      id: "fasada",
      label: { sr: "Fasada dogradnje", en: "Extension facade" },
      icon: "home",
      subcategories: [
        {
          id: "fasada_nova",
          label: { sr: "Nova fasada dogradnje", en: "New extension facade" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade dogradnje", en: "Extension facade area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 40, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "etics",
              kind: "toggle",
              label: { sr: "ETICS sistem (stiropor + malter)", en: "ETICS insulation (EPS + render)" },
              importance: "required",
            },
            {
              key: "uskladjivanje_sa_postojecom",
              kind: "select",
              label: { sr: "Usklađenost fasade sa postojećim objektom", en: "Facade match to existing building" },
              importance: "required",
              options: [
                { value: "isti_tip", label: { sr: "Isti tip i boja (vizuelno jedinstvo)", en: "Same type & colour (visual unity)" } },
                { value: "kontrastni", label: { sr: "Kontrastni materijal (svesna razlika)", en: "Contrasting material (intentional difference)" } },
                { value: "nije_vazno", label: { sr: "Nije bitno (npr. nema viđene fasade)", en: "Not important (e.g. not visible)" } },
              ],
            },
          ],
        },
        {
          id: "fasada_postojeca_osvezavanje",
          label: { sr: "Osvežavanje fasade postojećeg objekta", en: "Refreshing existing building facade" },
          description: {
            sr: "Ako se u okviru projekta radi i fasada celog objekta",
            en: "If the existing building facade is also being treated as part of the project",
          },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina postojeće fasade za osvežavanje", en: "Existing facade area to refresh" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Vrsta radova na postojećoj fasadi", en: "Work type on existing facade" },
              importance: "required",
              options: [
                { value: "samo_bojenje", label: { sr: "Samo bojenje (fasadna boja)", en: "Painting only (facade paint)" } },
                { value: "malterisanje", label: { sr: "Malterisanje + bojenje", en: "Render + paint" } },
                { value: "etics_dogradnja", label: { sr: "Novo ETICS (stiropor + malter)", en: "New ETICS (EPS + render)" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 5. SPOLJNA STOLARIJA DOGRADNJE
    // ─────────────────────────────────────────────────────────
    {
      id: "stolarija",
      label: { sr: "Stolarija dogradnje", en: "Extension joinery" },
      icon: "door-open",
      subcategories: [
        {
          id: "stolarija_prozori",
          label: { sr: "Prozori u dogradnji", en: "Extension windows" },
          fields: [
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj prozora / balkonskih vrata", en: "Number of windows / balcony doors" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6],
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
              ],
            },
          ],
        },
        {
          id: "stolarija_krovni_prozori",
          label: { sr: "Krovni prozori / svetlarnici", en: "Roof windows / skylights / rooflights" },
          fields: [
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj krovnih prozora", en: "Number of roof windows" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip", en: "Type" },
              importance: "optional",
              options: [
                { value: "krovni_prozor_velux", label: { sr: "Krovni prozor (Velux / Fakro tip)", en: "Roof window (Velux / Fakro type)" } },
                { value: "ravni_svetlarnik", label: { sr: "Ravni svetlarnik (tunel)", en: "Flat rooflight (tunnel)" } },
                { value: "lanterna_staklena", label: { sr: "Staklena lanterna (nad ravnim krovom)", en: "Glass lantern (above flat roof)" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 6. INSTALACIJE DOGRADNJE
    // ─────────────────────────────────────────────────────────
    {
      id: "instalacije",
      label: { sr: "Instalacije (proširenje/novi priključci)", en: "Services (extensions / new connections)" },
      icon: "zap",
      subcategories: [
        {
          id: "inst_elektrika",
          label: { sr: "Elektroinstalacije dogradnje", en: "Electrical for extension" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "produzenje_instalacije", label: { sr: "Produženje postojeće instalacije", en: "Extend existing installation" } },
                { value: "novi_strujni_krugovi", label: { sr: "Novi strujni krugovi za dogradnju", en: "New circuits for extension" } },
                { value: "prosirivanje_table", label: { sr: "Proširenje razvodne table", en: "Expand consumer unit" } },
              ],
            },
          ],
        },
        {
          id: "inst_vik",
          label: { sr: "ViK instalacije dogradnje", en: "Plumbing for extension" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "novo_kupatilo", label: { sr: "Novo kupatilo u dogradnji", en: "New bathroom in extension" } },
                { value: "nova_kuhinja", label: { sr: "Nova kuhinja / kuhinjski priključak", en: "New kitchen / kitchen connection" } },
                { value: "produzenje_cevi", label: { sr: "Produženje postojećih instalacija", en: "Extend existing pipes" } },
                { value: "septik_prosirenje", label: { sr: "Proširenje septičke jame", en: "Extend septic tank" } },
              ],
            },
          ],
        },
        {
          id: "inst_grejanje",
          label: { sr: "Grejanje u dogradnji", en: "Heating for extension" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items" },
              importance: "required",
              options: [
                { value: "novi_radijatori", label: { sr: "Novi radijatori (priključak na postojeći sistem)", en: "New radiators (connect to existing system)" } },
                { value: "podno_grejanje_dogradnja", label: { sr: "Podno grejanje u dogradnji", en: "UFH in extension" } },
                { value: "zamena_kotla_veci", label: { sr: "Zamena kotla (nedovoljna snaga za dogradnju)", en: "Replace boiler (insufficient for extension)" } },
                { value: "klima_dogradnja", label: { sr: "Klima uređaj za dogradnju", en: "AC unit for extension" } },
              ],
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 7. UNUTRAŠNJE ZAVRŠNE RADOVE DOGRADNJE
    // ─────────────────────────────────────────────────────────
    {
      id: "zavrse_radovi",
      label: { sr: "Unutrašnje završne radove dogradnje", en: "Extension internal fit-out" },
      icon: "paintbrush",
      subcategories: [
        {
          id: "zavrse_malterisanje",
          label: { sr: "Malterisanje i gletovanje", en: "Plastering & skim coating" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina zidova i plafona", en: "Wall & ceiling area" },
              importance: "required",
              unit: "m²",
              predefined: [40, 60, 80, 120, 160, 200],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "zavrse_podovi",
          label: { sr: "Podovi u dogradnji", en: "Extension flooring" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip poda", en: "Floor type" },
              importance: "required",
              options: [
                { value: "parket", label: { sr: "Parket", en: "Parquet" } },
                { value: "laminat", label: { sr: "Laminat", en: "Laminate" } },
                { value: "keramika", label: { sr: "Keramika", en: "Tiles" } },
                { value: "mikrocement", label: { sr: "Mikrocement", en: "Microcement" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "estrih",
              kind: "toggle",
              label: { sr: "Izrada estriha", en: "Screed" },
              importance: "required",
            },
          ],
        },
        {
          id: "zavrse_krecenje",
          label: { sr: "Krečenje i bojenje", en: "Painting" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina za bojenje", en: "Area to paint" },
              importance: "required",
              unit: "m²",
              predefined: [40, 60, 80, 120, 160],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "zavrse_stolarija",
          label: { sr: "Unutrašnja stolarija dogradnje", en: "Extension internal joinery" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj unutrašnjih vrata", en: "Number of internal doors" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5],
              unknownAllowed: true,
            },
          ],
        },
      ],
    },

  ],
};
