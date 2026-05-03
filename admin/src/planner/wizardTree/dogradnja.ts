import type { WizardProjectTree } from "./types";

export const dogradnjaTree: WizardProjectTree = {
  projectType: "extension",
  label: { sr: "Dogradnja / nadogradnja", en: "Extension", ru: "Пристройка / надстройка" },
  categories: [

    // ─────────────────────────────────────────────────────────
    // 1. PROJEKTNA DOKUMENTACIJA
    // ─────────────────────────────────────────────────────────
    {
      id: "projektna_dok",
      label: { sr: "Projektna dokumentacija", en: "Design & permits", ru: "Проектная документация" },
      icon: "file-text",
      subcategories: [
        {
          id: "dok_tip_dogradnje",
          label: { sr: "Tip dogradnje", en: "Extension type", ru: "Тип пристройки" },
          description: {
            sr: "Definiše koji projekat i dozvole su potrebni",
            en: "Determines which design and permits are required",
            ru: "Определяет, какой проект и разрешения необходимы",
          },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Vrsta radova", en: "Type of works", ru: "Вид работ" },
              importance: "required",
              options: [
                { value: "dogradnja_horizont", label: { sr: "Horizontalna dogradnja (proširenje osnove)", en: "Horizontal extension (footprint expansion)", ru: "Горизонтальная пристройка (расширение площади)" } },
                { value: "nadogradnja_sprat", label: { sr: "Vertikalna nadogradnja (novi sprat)", en: "Vertical extension (new storey)", ru: "Вертикальная надстройка (новый этаж)" } },
                { value: "adaptacija_potkrovlja", label: { sr: "Adaptacija potkrovlja u stambeni prostor", en: "Loft conversion (to habitable space)", ru: "Переустройство мансарды в жилое помещение" } },
                { value: "adaptacija_podruma", label: { sr: "Adaptacija podruma u stambeni prostor", en: "Basement conversion (to habitable space)", ru: "Переустройство подвала в жилое помещение" } },
                { value: "prizemna_dogradnja", label: { sr: "Prizemna dogradnja (garaza, ostava, letnjakuhinja)", en: "Single-storey addition (garage, utility, summer kitchen)", ru: "Одноэтажная пристройка (гараж, кладовая, летняя кухня)" } },
              ],
            },
            {
              key: "povrsina_dogradnje",
              kind: "area",
              label: { sr: "Planirana površina dogradnje", en: "Planned extension area", ru: "Планируемая площадь пристройки" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "postojeci_objekat_povrsina",
              kind: "area",
              label: { sr: "Površina postojećeg objekta", en: "Existing building area", ru: "Площадь существующего здания" },
              importance: "optional",
              unit: "m²",
              predefined: [50, 70, 100, 120, 150, 200],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "dok_dozvola",
          label: { sr: "Dozvole i odobrenja", en: "Permits & approvals", ru: "Разрешения и согласования" },
          fields: [
            {
              key: "faza",
              kind: "select",
              label: { sr: "Trenutna faza", en: "Current stage", ru: "Текущая стадия" },
              importance: "required",
              options: [
                { value: "nije_poceto", label: { sr: "Nije početo — treba projekat i dozvola", en: "Not started — need design and permit", ru: "Не начато — нужен проект и разрешение" } },
                { value: "projekat_spreman", label: { sr: "Projekat spreman, čekam dozvolu", en: "Plans ready, awaiting permit", ru: "Проект готов, жду разрешения" } },
                { value: "dozvola_dobijena", label: { sr: "Dozvola dobijena", en: "Permit obtained", ru: "Разрешение получено" } },
              ],
            },
            {
              key: "vlasnistvo_uredeno",
              kind: "toggle",
              label: { sr: "Imovinsko-pravni odnosi uređeni (list nepokretnosti čist)", en: "Property rights clear (no encumbrances)", ru: "Имущественные права урегулированы (нет обременений)" },
              importance: "required",
            },
            {
              key: "arhitekta_postoji",
              kind: "toggle",
              label: { sr: "Već imam arhitektu", en: "I already have an architect", ru: "У меня уже есть архитектор" },
              importance: "required",
            },
          ],
          estimateNotes: {
            sr: "Za dogradnju/nadogradnju potrebna je nova građevinska dozvola ili izmena i dopuna postojeće. AI agent daje lokacijske linkove.",
            en: "Extension requires a new building permit or amendment to existing. AI agent provides location-specific links.",
            ru: "Для пристройки/надстройки требуется новое разрешение на строительство или изменение существующего. ИИ-агент предоставляет ссылки по вашему местоположению.",
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // 2. TEMELJI ZA DOGRADNJU
    // ─────────────────────────────────────────────────────────
    {
      id: "temelji",
      label: { sr: "Temelji za dogradnju", en: "Extension foundations", ru: "Фундамент для пристройки" },
      icon: "layers",
      subcategories: [
        {
          id: "temelji_iskop",
          label: { sr: "Iskop i temelji (horizontalna dogradnja)", en: "Excavation & foundations (horizontal extension)", ru: "Земляные работы и фундамент (горизонтальная пристройка)" },
          fields: [
            {
              key: "povrsina_iskopa",
              kind: "area",
              label: { sr: "Površina iskopa", en: "Excavation area", ru: "Площадь земляных работ" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "tip_temelja",
              kind: "select",
              label: { sr: "Tip temelja", en: "Foundation type", ru: "Тип фундамента" },
              importance: "required",
              options: [
                { value: "temeljne_trake", label: { sr: "Temeljne trake (armirani beton)", en: "Strip foundations (RC)", ru: "Ленточный фундамент (железобетон)" } },
                { value: "temeljna_ploca", label: { sr: "Temeljna ploča", en: "Raft foundation", ru: "Плитный фундамент" } },
              ],
            },
            {
              key: "veza_sa_postojecim",
              kind: "select",
              label: { sr: "Veza sa postojećim temeljima", en: "Connection to existing foundations", ru: "Связь с существующим фундаментом" },
              importance: "required",
              options: [
                { value: "dilatacija", label: { sr: "Dilatacija (odvojena konstrukcija)", en: "Expansion joint (separate structure)", ru: "Деформационный шов (отдельная конструкция)" } },
                { value: "vezivanje", label: { sr: "Vezivanje (monolitna veza)", en: "Tied in (monolithic connection)", ru: "Связка (монолитное соединение)" } },
              ],
            },
            {
              key: "hidroizolacija",
              kind: "toggle",
              label: { sr: "Hidroizolacija temelja", en: "Foundation waterproofing", ru: "Гидроизоляция фундамента" },
              importance: "required",
            },
          ],
        },
        {
          id: "temelji_ojacanje",
          label: { sr: "Ojačanje postojeće konstrukcije", en: "Strengthening existing structure", ru: "Усиление существующей конструкции" },
          description: {
            sr: "Potrebno za nadogradnju novog sprata na postojeći objekat",
            en: "Required when adding a new storey to an existing building",
            ru: "Необходимо при надстройке нового этажа на существующее здание",
          },
          fields: [
            {
              key: "geomehanicki_izvestaj",
              kind: "toggle",
              label: { sr: "Potreban geomehanički izveštaj tla", en: "Geotechnical survey required", ru: "Требуется геомеханический отчёт о грунте" },
              importance: "required",
            },
            {
              key: "staticka_analiza",
              kind: "toggle",
              label: { sr: "Statička analiza postojeće konstrukcije", en: "Structural analysis of existing building", ru: "Статический анализ существующей конструкции" },
              importance: "required",
            },
            {
              key: "intervencije",
              kind: "chips",
              label: { sr: "Predviđene intervencije", en: "Anticipated interventions", ru: "Планируемые вмешательства" },
              importance: "optional",
              options: [
                { value: "injekcija_temelja", label: { sr: "Injektiranje temelja", en: "Foundation injection/underpinning", ru: "Инъектирование фундамента" } },
                { value: "ab_serklas", label: { sr: "AB serklaž (venac za novu etažu)", en: "RC ring beam (for new storey)", ru: "ЖБ сейсмопояс (для нового этажа)" } },
                { value: "ojacanje_zidova", label: { sr: "Ojačanje nosivih zidova", en: "Strengthening load-bearing walls", ru: "Усиление несущих стен" } },
                { value: "nova_ab_plocha", label: { sr: "Nova AB ploča kao temelj novog sprata", en: "New RC slab as base for new storey", ru: "Новая ЖБ плита как основание нового этажа" } },
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
      label: { sr: "Konstruktivni sistem dogradnje", en: "Extension structural system", ru: "Конструктивная система пристройки" },
      icon: "building",
      subcategories: [
        {
          id: "konstrukcija_zidanje",
          label: { sr: "Zidanje dogradnje", en: "Extension masonry", ru: "Кладка пристройки" },
          fields: [
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal zidanja", en: "Wall material", ru: "Материал кладки" },
              importance: "required",
              options: [
                { value: "blok_termo", label: { sr: "Termo blok (poroton / siporex)", en: "Thermal block (AAC / Poroton)", ru: "Теплоблок (газобетон / поротон)" } },
                { value: "opeka", label: { sr: "Blok opeka", en: "Brick block", ru: "Кирпичный блок" } },
                { value: "ab_prefabrikovano", label: { sr: "Prefabrikovani AB elementi", en: "Precast RC panels", ru: "Сборные ЖБ элементы" } },
                { value: "drvena_konstrukcija", label: { sr: "Drvena skeletna konstrukcija", en: "Timber frame", ru: "Деревянный каркас" } },
                { value: "celicna_sk", label: { sr: "Čelična skeletna konstrukcija", en: "Steel frame", ru: "Стальной каркас" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina dogradnje (tlocrt)", en: "Extension footprint area", ru: "Площадь пристройки (план)" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "visina_etaze",
              kind: "select",
              label: { sr: "Visina etaže dogradnje", en: "Extension storey height", ru: "Высота этажа пристройки" },
              importance: "optional",
              options: [
                { value: "240", label: { sr: "2.40 m (niska)", en: "2.40 m (low)", ru: "2.40 м (низкая)" } },
                { value: "260", label: { sr: "2.60 m (standard)", en: "2.60 m (standard)", ru: "2.60 м (стандарт)" } },
                { value: "280", label: { sr: "2.80 m (viša)", en: "2.80 m (tall)", ru: "2.80 м (высокая)" } },
                { value: "300", label: { sr: "3.00 m i više", en: "3.00 m and above", ru: "3.00 м и более" } },
              ],
            },
          ],
        },
        {
          id: "konstrukcija_krov_dogradnje",
          label: { sr: "Krov dogradnje", en: "Extension roof", ru: "Кровля пристройки" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip krova dogradnje", en: "Extension roof type", ru: "Тип кровли пристройки" },
              importance: "required",
              options: [
                { value: "ravni", label: { sr: "Ravni krov (monolit AB + membrana)", en: "Flat roof (RC slab + membrane)", ru: "Плоская кровля (монолит ЖБ + мембрана)" } },
                { value: "jednovodan", label: { sr: "Jednovodni krov (shed roof)", en: "Mono-pitch (shed) roof", ru: "Односкатная кровля" } },
                { value: "dvovodan", label: { sr: "Dvovodan krov (nastavak postojećeg)", en: "Dual-pitch roof (matching existing)", ru: "Двускатная кровля (продолжение существующей)" } },
                { value: "staklena_krovina", label: { sr: "Staklena krovina (svetlarnik)", en: "Glazed roof (rooflight / lantern)", ru: "Стеклянная кровля (световой фонарь)" } },
              ],
            },
            {
              key: "povrsina_krova",
              kind: "area",
              label: { sr: "Površina krova", en: "Roof area", ru: "Площадь кровли" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "izolacija",
              kind: "toggle",
              label: { sr: "Termoizolacija krova/tavanice", en: "Roof/ceiling insulation", ru: "Теплоизоляция кровли/потолка" },
              importance: "required",
            },
          ],
        },
        {
          id: "konstrukcija_spajanje",
          label: { sr: "Spajanje sa postojećim objektom", en: "Connection to existing building", ru: "Соединение с существующим зданием" },
          fields: [
            {
              key: "probijanje_zida",
              kind: "toggle",
              label: { sr: "Probijanje zida (novo otvaranje prema dogradnji)", en: "Knock through (new opening to extension)", ru: "Пробивка стены (новый проём в пристройку)" },
              importance: "required",
            },
            {
              key: "broj_otvora",
              kind: "number",
              label: { sr: "Broj novih otvora (vrata/prolaza)", en: "Number of new openings (doors / passageways)", ru: "Количество новых проёмов (двери / проходы)" },
              importance: "optional",
              unit: "kom",
              predefined: [1, 2, 3],
              unknownAllowed: false,
              showWhen: { probijanje_zida: true },
            },
            {
              key: "tip_nosaca_nad_otvorom",
              kind: "select",
              label: { sr: "Nadvratnik / greda nad otvorom", en: "Lintel / beam over opening", ru: "Перемычка / балка над проёмом" },
              importance: "optional",
              options: [
                { value: "ab_greda", label: { sr: "AB greda (monolitna)", en: "RC beam (in-situ)", ru: "ЖБ балка (монолитная)" } },
                { value: "celicna_greda", label: { sr: "Čelična greda (IPE profil)", en: "Steel beam (IPE profile)", ru: "Стальная балка (профиль IPE)" } },
                { value: "prefabrikovani_nadvratnik", label: { sr: "Prefabrikovani nadvratnik", en: "Prefabricated lintel", ru: "Сборная перемычка" } },
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
      label: { sr: "Fasada dogradnje", en: "Extension facade", ru: "Фасад пристройки" },
      icon: "home",
      subcategories: [
        {
          id: "fasada_nova",
          label: { sr: "Nova fasada dogradnje", en: "New extension facade", ru: "Новый фасад пристройки" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade dogradnje", en: "Extension facade area", ru: "Площадь фасада пристройки" },
              importance: "required",
              unit: "m²",
              predefined: [20, 40, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "etics",
              kind: "toggle",
              label: { sr: "ETICS sistem (stiropor + malter)", en: "ETICS insulation (EPS + render)", ru: "Система ETICS (пенопласт + штукатурка)" },
              importance: "required",
            },
            {
              key: "uskladjivanje_sa_postojecom",
              kind: "select",
              label: { sr: "Usklađenost fasade sa postojećim objektom", en: "Facade match to existing building", ru: "Соответствие фасада существующему зданию" },
              importance: "required",
              options: [
                { value: "isti_tip", label: { sr: "Isti tip i boja (vizuelno jedinstvo)", en: "Same type & colour (visual unity)", ru: "Тот же тип и цвет (визуальное единство)" } },
                { value: "kontrastni", label: { sr: "Kontrastni materijal (svesna razlika)", en: "Contrasting material (intentional difference)", ru: "Контрастный материал (намеренное отличие)" } },
                { value: "nije_vazno", label: { sr: "Nije bitno (npr. nema viđene fasade)", en: "Not important (e.g. not visible)", ru: "Не важно (напр. фасад не виден)" } },
              ],
            },
          ],
        },
        {
          id: "fasada_postojeca_osvezavanje",
          label: { sr: "Osvežavanje fasade postojećeg objekta", en: "Refreshing existing building facade", ru: "Обновление фасада существующего здания" },
          description: {
            sr: "Ako se u okviru projekta radi i fasada celog objekta",
            en: "If the existing building facade is also being treated as part of the project",
            ru: "Если в рамках проекта также выполняется фасад всего здания",
          },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina postojeće fasade za osvežavanje", en: "Existing facade area to refresh", ru: "Площадь существующего фасада для обновления" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Vrsta radova na postojećoj fasadi", en: "Work type on existing facade", ru: "Вид работ на существующем фасаде" },
              importance: "required",
              options: [
                { value: "samo_bojenje", label: { sr: "Samo bojenje (fasadna boja)", en: "Painting only (facade paint)", ru: "Только покраска (фасадная краска)" } },
                { value: "malterisanje", label: { sr: "Malterisanje + bojenje", en: "Render + paint", ru: "Штукатурка + покраска" } },
                { value: "etics_dogradnja", label: { sr: "Novo ETICS (stiropor + malter)", en: "New ETICS (EPS + render)", ru: "Новая система ETICS (пенопласт + штукатурка)" } },
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
      label: { sr: "Stolarija dogradnje", en: "Extension joinery", ru: "Столярные изделия пристройки" },
      icon: "door-open",
      subcategories: [
        {
          id: "stolarija_prozori",
          label: { sr: "Prozori u dogradnji", en: "Extension windows", ru: "Окна в пристройке" },
          fields: [
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj prozora / balkonskih vrata", en: "Number of windows / balcony doors", ru: "Количество окон / балконных дверей" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Frame material", ru: "Материал рамы" },
              importance: "required",
              options: [
                { value: "pvc", label: { sr: "PVC", en: "PVC", ru: "ПВХ" } },
                { value: "aluminijum", label: { sr: "Aluminijum", en: "Aluminium", ru: "Алюминий" } },
                { value: "drvo", label: { sr: "Drvo", en: "Wood", ru: "Дерево" } },
              ],
            },
          ],
        },
        {
          id: "stolarija_krovni_prozori",
          label: { sr: "Krovni prozori / svetlarnici", en: "Roof windows / skylights / rooflights", ru: "Мансардные окна / световые фонари" },
          fields: [
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj krovnih prozora", en: "Number of roof windows", ru: "Количество мансардных окон" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip", en: "Type", ru: "Тип" },
              importance: "optional",
              options: [
                { value: "krovni_prozor_velux", label: { sr: "Krovni prozor (Velux / Fakro tip)", en: "Roof window (Velux / Fakro type)", ru: "Мансардное окно (тип Velux / Fakro)" } },
                { value: "ravni_svetlarnik", label: { sr: "Ravni svetlarnik (tunel)", en: "Flat rooflight (tunnel)", ru: "Плоский световой фонарь (туннель)" } },
                { value: "lanterna_staklena", label: { sr: "Staklena lanterna (nad ravnim krovom)", en: "Glass lantern (above flat roof)", ru: "Стеклянный фонарь (над плоской кровлей)" } },
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
      label: { sr: "Instalacije (proširenje/novi priključci)", en: "Services (extensions / new connections)", ru: "Коммуникации (расширение / новые подключения)" },
      icon: "zap",
      subcategories: [
        {
          id: "inst_elektrika",
          label: { sr: "Elektroinstalacije dogradnje", en: "Electrical for extension", ru: "Электроснабжение пристройки" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "produzenje_instalacije", label: { sr: "Produženje postojeće instalacije", en: "Extend existing installation", ru: "Продление существующей проводки" } },
                { value: "novi_strujni_krugovi", label: { sr: "Novi strujni krugovi za dogradnju", en: "New circuits for extension", ru: "Новые электроцепи для пристройки" } },
                { value: "prosirivanje_table", label: { sr: "Proširenje razvodne table", en: "Expand consumer unit", ru: "Расширение распределительного щита" } },
              ],
            },
          ],
        },
        {
          id: "inst_vik",
          label: { sr: "ViK instalacije dogradnje", en: "Plumbing for extension", ru: "Сантехника пристройки" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "novo_kupatilo", label: { sr: "Novo kupatilo u dogradnji", en: "New bathroom in extension", ru: "Новая ванная в пристройке" } },
                { value: "nova_kuhinja", label: { sr: "Nova kuhinja / kuhinjski priključak", en: "New kitchen / kitchen connection", ru: "Новая кухня / кухонное подключение" } },
                { value: "produzenje_cevi", label: { sr: "Produženje postojećih instalacija", en: "Extend existing pipes", ru: "Продление существующих труб" } },
                { value: "septik_prosirenje", label: { sr: "Proširenje septičke jame", en: "Extend septic tank", ru: "Расширение септика" } },
              ],
            },
          ],
        },
        {
          id: "inst_grejanje",
          label: { sr: "Grejanje u dogradnji", en: "Heating for extension", ru: "Отопление пристройки" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "novi_radijatori", label: { sr: "Novi radijatori (priključak na postojeći sistem)", en: "New radiators (connect to existing system)", ru: "Новые радиаторы (подключение к существующей системе)" } },
                { value: "podno_grejanje_dogradnja", label: { sr: "Podno grejanje u dogradnji", en: "UFH in extension", ru: "Тёплый пол в пристройке" } },
                { value: "zamena_kotla_veci", label: { sr: "Zamena kotla (nedovoljna snaga za dogradnju)", en: "Replace boiler (insufficient for extension)", ru: "Замена котла (недостаточная мощность для пристройки)" } },
                { value: "klima_dogradnja", label: { sr: "Klima uređaj za dogradnju", en: "AC unit for extension", ru: "Кондиционер для пристройки" } },
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
      label: { sr: "Unutrašnje završne radove dogradnje", en: "Extension internal fit-out", ru: "Внутренняя отделка пристройки" },
      icon: "paintbrush",
      subcategories: [
        {
          id: "zavrse_malterisanje",
          label: { sr: "Malterisanje i gletovanje", en: "Plastering & skim coating", ru: "Штукатурка и шпаклёвка" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina zidova i plafona", en: "Wall & ceiling area", ru: "Площадь стен и потолков" },
              importance: "required",
              unit: "m²",
              predefined: [40, 60, 80, 120, 160, 200],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "zavrse_podovi",
          label: { sr: "Podovi u dogradnji", en: "Extension flooring", ru: "Полы в пристройке" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip poda", en: "Floor type", ru: "Тип пола" },
              importance: "required",
              options: [
                { value: "parket", label: { sr: "Parket", en: "Parquet", ru: "Паркет" } },
                { value: "laminat", label: { sr: "Laminat", en: "Laminate", ru: "Ламинат" } },
                { value: "keramika", label: { sr: "Keramika", en: "Tiles", ru: "Плитка" } },
                { value: "mikrocement", label: { sr: "Mikrocement", en: "Microcement", ru: "Микроцемент" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area", ru: "Площадь пола" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "estrih",
              kind: "toggle",
              label: { sr: "Izrada estriha", en: "Screed", ru: "Стяжка" },
              importance: "required",
            },
          ],
        },
        {
          id: "zavrse_krecenje",
          label: { sr: "Krečenje i bojenje", en: "Painting", ru: "Побелка и покраска" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina za bojenje", en: "Area to paint", ru: "Площадь для покраски" },
              importance: "required",
              unit: "m²",
              predefined: [40, 60, 80, 120, 160],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "zavrse_stolarija",
          label: { sr: "Unutrašnja stolarija dogradnje", en: "Extension internal joinery", ru: "Внутренние столярные изделия пристройки" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj unutrašnjih vrata", en: "Number of internal doors", ru: "Количество межкомнатных дверей" },
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
