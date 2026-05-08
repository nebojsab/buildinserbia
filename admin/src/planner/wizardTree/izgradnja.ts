import type { WizardProjectTree } from "./types";

export const izgradnjaTree: WizardProjectTree = {
  projectType: "newbuild",
  label: { sr: "Izgradnja", en: "New build", ru: "Новое строительство" },
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
          id: "dok_idejni",
          label: { sr: "Idejno rešenje / idejni projekat", en: "Concept design", ru: "Концептуальное решение / концептуальный проект" },
          fields: [
            {
              key: "povrsina_objekta",
              kind: "area",
              label: { sr: "Planirana BRP (bruto razvijena površina)", en: "Planned GFA (gross floor area)", ru: "Планируемая общая площадь (GFA)" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250, 300],
              unknownAllowed: true,
            },
            {
              key: "broj_etaza",
              kind: "select",
              label: { sr: "Broj etaža", en: "Number of storeys", ru: "Количество этажей" },
              importance: "required",
              options: [
                { value: "p", label: { sr: "Prizemlje (P)", en: "Ground floor only (G)", ru: "Только первый этаж (Г)" } },
                { value: "p1", label: { sr: "Prizemlje + 1 sprat (P+1)", en: "Ground + 1 (G+1)", ru: "1-й этаж + 1 (Г+1)" } },
                { value: "p2", label: { sr: "Prizemlje + 2 sprata (P+2)", en: "Ground + 2 (G+2)", ru: "1-й этаж + 2 (Г+2)" } },
                { value: "p_potkrovlje", label: { sr: "Prizemlje + potkrovlje (P+Pk)", en: "Ground + loft (G+Loft)", ru: "1-й этаж + мансарда (Г+М)" } },
                { value: "p1_potkrovlje", label: { sr: "P+1+Potkrovlje", en: "G+1+Loft", ru: "Г+1+Мансарда" } },
                { value: "podrum_p", label: { sr: "Podrum + Prizemlje", en: "Basement + Ground", ru: "Подвал + 1-й этаж" } },
                { value: "podrum_p1", label: { sr: "Podrum + P+1", en: "Basement + G+1", ru: "Подвал + Г+1" } },
              ],
            },
            {
              key: "tip_objekta",
              kind: "select",
              label: { sr: "Tip objekta", en: "Building type", ru: "Тип здания" },
              importance: "required",
              options: [
                { value: "porodicna_kuca", label: { sr: "Porodična kuća", en: "Detached house", ru: "Отдельный дом" } },
                { value: "dvojna_kuca", label: { sr: "Dvojna kuća (polu-slobodnostojeća)", en: "Semi-detached house", ru: "Двухквартирный дом (таунхаус)" } },
                { value: "vikendica", label: { sr: "Vikendica", en: "Holiday cottage", ru: "Дача / загородный домик" } },
                { value: "stambeno_poslovni", label: { sr: "Stambeno-poslovni objekat", en: "Mixed-use (residential + commercial)", ru: "Жилое-коммерческое здание" } },
                { value: "poslovni", label: { sr: "Poslovni objekat", en: "Commercial building", ru: "Коммерческое здание" } },
              ],
            },
            {
              key: "arhitekta_postoji",
              kind: "toggle",
              label: { sr: "Već imam arhitektu / projektanta", en: "I already have an architect", ru: "У меня уже есть архитектор / проектировщик" },
              importance: "required",
            },
          ],
        },
        {
          id: "dok_gradevinska_dozvola",
          label: { sr: "Građevinska dozvola i odobrenja", en: "Building permit & approvals", ru: "Разрешение на строительство и согласования" },
          fields: [
            {
              key: "faza",
              kind: "select",
              label: { sr: "Trenutna faza", en: "Current stage", ru: "Текущая стадия" },
              importance: "required",
              options: [
                { value: "nije_poceto", label: { sr: "Nije početo — treba sve od početka", en: "Not started — need everything from scratch", ru: "Не начато — нужно всё с нуля" } },
                { value: "parcela_uredjena", label: { sr: "Parcela uređena, nema dozvole", en: "Plot ready, no permit yet", ru: "Участок оформлен, разрешения нет" } },
                { value: "lokacijski_uslovi", label: { sr: "Imam lokacijske uslove", en: "Have location conditions", ru: "Есть градостроительные условия" } },
                { value: "projekat_spreman", label: { sr: "Projekat spreman, čekam dozvolu", en: "Plans ready, awaiting permit", ru: "Проект готов, жду разрешения" } },
                { value: "dozvola_dobijena", label: { sr: "Dozvola dobijena", en: "Permit already obtained", ru: "Разрешение уже получено" } },
              ],
            },
            {
              key: "rgz_snimak",
              kind: "toggle",
              label: { sr: "Potreban geodetski snimak parcele (RGZ)", en: "Cadastral survey required (RGZ)", ru: "Требуется геодезическая съёмка участка (RGZ)" },
              importance: "optional",
            },
            {
              key: "priključci_komunalni",
              kind: "chips",
              label: { sr: "Komunalni priključci koje treba urediti", en: "Utility connections to arrange", ru: "Коммунальные подключения для оформления" },
              importance: "optional",
              options: [
                { value: "struja", label: { sr: "Struja (EPS/elektrodistribucija)", en: "Electricity", ru: "Электричество (EPS / электрораспределение)" } },
                { value: "voda", label: { sr: "Vodovod (JKP)", en: "Water supply", ru: "Водоснабжение (JKP)" } },
                { value: "kanalizacija", label: { sr: "Kanalizacija (JKP)", en: "Sewage", ru: "Канализация (JKP)" } },
                { value: "gas", label: { sr: "Gas (Srbijagas / lokalni distributer)", en: "Gas", ru: "Газ (Srbijagas / местный поставщик)" } },
                { value: "telekomunikacije", label: { sr: "Telekomunikacije (optika)", en: "Telecommunications (fibre)", ru: "Телекоммуникации (оптоволокно)" } },
              ],
            },
          ],
          estimateNotes: {
            sr: "Takse za dozvole variraju po opštini — AI agent će dati konkretne linkove za vašu lokaciju.",
            en: "Permit fees vary by municipality — AI agent will provide specific links for your location.",
            ru: "Сборы за разрешения варьируются по муниципалитету — ИИ-агент предоставит конкретные ссылки для вашего местоположения.",
          },
        },
        {
          id: "dok_izvodjacki",
          label: { sr: "Izvođački projekat (PGP)", en: "Construction drawings (tender package)", ru: "Рабочий проект (тендерный пакет)" },
          fields: [
            {
              key: "struke",
              kind: "chips",
              label: { sr: "Potrebne struke u projektu", en: "Required disciplines", ru: "Необходимые разделы проекта" },
              importance: "required",
              options: [
                { value: "arhitektura", label: { sr: "Arhitektura", en: "Architecture", ru: "Архитектура" } },
                { value: "konstrukcija", label: { sr: "Konstrukcija (statika)", en: "Structural engineering", ru: "Конструкции (статика)" } },
                { value: "elektro", label: { sr: "Elektroinženjering", en: "Electrical engineering", ru: "Электроснабжение" } },
                { value: "masinski_vik", label: { sr: "Mašinske instalacije (ViK, grejanje)", en: "Mechanical (plumbing, heating)", ru: "Инженерные сети (сантехника, отопление)" } },
                { value: "protivpozarni", label: { sr: "Protivpožarni projekat", en: "Fire protection", ru: "Пожарная защита" } },
                { value: "energetski_pasos", label: { sr: "Elaborat o energetskim svojstvima", en: "Energy performance report", ru: "Энергетический паспорт" } },
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
      label: { sr: "Temelji i iskop", en: "Foundations & excavation", ru: "Фундамент и земляные работы" },
      icon: "layers",
      subcategories: [
        {
          id: "iskop",
          label: { sr: "Mašinski iskop", en: "Mechanical excavation", ru: "Механическая выемка грунта" },
          fields: [
            {
              key: "povrsina_iskopa",
              kind: "area",
              label: { sr: "Površina iskopa", en: "Excavation area", ru: "Площадь земляных работ" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "dubina_iskopa",
              kind: "select",
              label: { sr: "Dubina iskopa", en: "Excavation depth", ru: "Глубина выемки" },
              importance: "required",
              options: [
                { value: "do_1m", label: { sr: "Do 1 m (plitki temelji)", en: "Up to 1 m (shallow foundations)", ru: "До 1 м (мелкое заложение)" } },
                { value: "1_2m", label: { sr: "1–2 m (temelji sa podrumom)", en: "1–2 m (with basement)", ru: "1–2 м (с подвалом)" } },
                { value: "2_3m", label: { sr: "2–3 m (potpuno ukopan podrum)", en: "2–3 m (full basement)", ru: "2–3 м (полный подвал)" } },
                { value: "vise_od_3m", label: { sr: "Više od 3 m", en: "More than 3 m", ru: "Более 3 м" } },
              ],
            },
            {
              key: "tip_tla",
              kind: "select",
              label: { sr: "Tip tla (okvirno)", en: "Soil type (approx)", ru: "Тип грунта (приблизительно)" },
              importance: "optional",
              options: [
                { value: "zemlja_glinasta", label: { sr: "Zemlja / glina (normalan iskop)", en: "Earth / clay (standard dig)", ru: "Земля / глина (стандартная выемка)" } },
                { value: "pesak_sljunak", label: { sr: "Pesak / šljunak", en: "Sand / gravel", ru: "Песок / гравий" } },
                { value: "kamen_stena", label: { sr: "Kamen / stena (otežan iskop)", en: "Rock (difficult excavation)", ru: "Камень / скала (сложная выемка)" } },
              ],
            },
            {
              key: "odvoz_zemlje",
              kind: "toggle",
              label: { sr: "Odvoz iskopane zemlje", en: "Removal of excavated spoil", ru: "Вывоз вынутого грунта" },
              importance: "required",
            },
          ],
        },
        {
          id: "temelji_temeljne_trake",
          label: { sr: "Temeljne trake / temeljne ploče", en: "Strip foundations / raft foundations", ru: "Ленточный фундамент / плитный фундамент" },
          fields: [
            {
              key: "tip_temelja",
              kind: "chips",
              label: { sr: "Tip temelja (može više)", en: "Foundation type (multi-select)", ru: "Тип фундамента (можно несколько)" },
              importance: "required",
              options: [
                { value: "temeljne_trake", label: { sr: "Temeljne trake (AB)", en: "Strip foundations (RC)", ru: "Ленточный фундамент (ЖБ)" } },
                { value: "temeljna_ploca", label: { sr: "Temeljna ploča (AB)", en: "Raft foundation (RC)", ru: "Плитный фундамент (ЖБ)" } },
                { value: "stubovi_samci", label: { sr: "Stupni temelji / samci", en: "Pad / isolated footings", ru: "Столбчатый фундамент" } },
                { value: "sipovi", label: { sr: "Šipovi (loše tlo)", en: "Piles (poor ground)", ru: "Сваи (слабый грунт)" } },
              ],
            },
            {
              key: "povrsina_temelja",
              kind: "area",
              label: { sr: "Površina temelja (m²)", en: "Foundation area (m²)", ru: "Площадь фундамента (м²)" },
              importance: "required",
              unit: "m²",
              predefined: [40, 60, 80, 100, 120, 150],
              unknownAllowed: true,
            },
            {
              key: "hidroizolacija_temelja",
              kind: "toggle",
              label: { sr: "Hidroizolacija temelja", en: "Foundation waterproofing", ru: "Гидроизоляция фундамента" },
              importance: "required",
            },
            {
              key: "drenaza",
              kind: "toggle",
              label: { sr: "Drenažni sistem oko temelja", en: "Perimeter drainage system", ru: "Дренажная система вокруг фундамента" },
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
      label: { sr: "Konstruktivni sistem", en: "Structural system", ru: "Конструктивная система" },
      icon: "building",
      subcategories: [
        {
          id: "konstrukcija_zidanje",
          label: { sr: "Zidanje (nosivi i pregradni zidovi)", en: "Masonry (load-bearing & partition walls)", ru: "Кладка (несущие и перегородочные стены)" },
          fields: [
            {
              key: "materijal_nosivi",
              kind: "select",
              label: { sr: "Materijal nosivih zidova", en: "Load-bearing wall material", ru: "Материал несущих стен" },
              importance: "required",
              options: [
                { value: "blok_termo", label: { sr: "Termo blok (poroton / siporex)", en: "Thermal block (AAC / Poroton)", ru: "Теплоблок (газобетон / поротон)" } },
                { value: "opeka_puna", label: { sr: "Puna opeka", en: "Solid brick", ru: "Полнотелый кирпич" } },
                { value: "opeka_suplja", label: { sr: "Šuplja blok opeka", en: "Hollow brick block", ru: "Пустотелый кирпичный блок" } },
                { value: "ab_okvir_zidanje", label: { sr: "AB skelet + ispuna (blok / knauf)", en: "RC frame + infill (block / Knauf)", ru: "ЖБ каркас + заполнение (блок / Knauf)" } },
              ],
            },
            {
              key: "debljina_nosivog_zida",
              kind: "select",
              label: { sr: "Debljina nosivih zidova", en: "Load-bearing wall thickness", ru: "Толщина несущих стен" },
              importance: "optional",
              options: [
                { value: "20cm", label: { sr: "20 cm", en: "20 cm", ru: "20 см" } },
                { value: "25cm", label: { sr: "25 cm", en: "25 cm", ru: "25 см" } },
                { value: "30cm", label: { sr: "30 cm", en: "30 cm", ru: "30 см" } },
                { value: "38cm", label: { sr: "38 cm", en: "38 cm", ru: "38 см" } },
              ],
            },
            {
              key: "povrsina_objekta",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area", ru: "Общая площадь здания" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "materijal_pregradni",
              kind: "select",
              label: { sr: "Pregradni zidovi", en: "Partition walls", ru: "Перегородки" },
              importance: "optional",
              options: [
                { value: "blok_10cm", label: { sr: "Blok 10 cm", en: "10 cm block", ru: "Блок 10 см" } },
                { value: "gipskarton", label: { sr: "Gips-karton (suvomontaža)", en: "Plasterboard (drylining)", ru: "Гипсокартон (сухой монтаж)" } },
                { value: "opeka_pregradna", label: { sr: "Pregradna opeka", en: "Partition brick", ru: "Перегородочный кирпич" } },
              ],
            },
          ],
        },
        {
          id: "konstrukcija_ploce",
          label: { sr: "Armiranobetonske ploče (međuspratne)", en: "Reinforced concrete slabs (intermediate floors)", ru: "Железобетонные плиты (межэтажные перекрытия)" },
          fields: [
            {
              key: "tip_ploce",
              kind: "select",
              label: { sr: "Tip ploče", en: "Slab type", ru: "Тип плиты" },
              importance: "required",
              options: [
                { value: "monolitna_ab", label: { sr: "Monolitna AB ploča (lice u lice)", en: "Monolithic RC slab (cast in situ)", ru: "Монолитная ЖБ плита (заливка на месте)" } },
                { value: "prednapregnuta", label: { sr: "Prednapregnutu šupljikave ploče (fert-beton)", en: "Prestressed hollow-core planks", ru: "Предварительно напряжённые пустотные плиты (фёрт-бетон)" } },
                { value: "ab_rebricasta", label: { sr: "AB rebrasta ploča (Fert sistem)", en: "RC ribbed slab (Fert system)", ru: "ЖБ ребристая плита (система Fert)" } },
              ],
            },
            {
              key: "povrsina_ploce",
              kind: "area",
              label: { sr: "Površina ploče (po etaži)", en: "Slab area (per floor)", ru: "Площадь плиты (на этаж)" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "broj_ploca",
              kind: "number",
              label: { sr: "Broj međuspratnih ploča", en: "Number of intermediate slabs", ru: "Количество межэтажных плит" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3],
              unknownAllowed: false,
            },
          ],
        },
        {
          id: "konstrukcija_stepenice",
          label: { sr: "Stepenice", en: "Stairs", ru: "Лестница" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip stepenica", en: "Stair type", ru: "Тип лестницы" },
              importance: "required",
              options: [
                { value: "ab_monolitne", label: { sr: "AB monolitne (u sklopu konstrukcije)", en: "Monolithic RC (in-situ)", ru: "Монолитный ЖБ (заливка на месте)" } },
                { value: "celicne", label: { sr: "Čelična konstrukcija (metalne)", en: "Steel structure", ru: "Стальная конструкция (металлическая)" } },
                { value: "drvene", label: { sr: "Drvene stepenice", en: "Timber stairs", ru: "Деревянная лестница" } },
                { value: "staklene_celicne", label: { sr: "Staklene / čelične (dizajnerske)", en: "Glass / steel (designer)", ru: "Стекло / сталь (дизайнерская)" } },
              ],
            },
            {
              key: "broj_etaza_koje_povezuje",
              kind: "number",
              label: { sr: "Broj etaža koje stepenice povezuju", en: "Number of floors connected", ru: "Количество этажей, которые соединяет лестница" },
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
      label: { sr: "Krov", en: "Roof", ru: "Кровля" },
      icon: "triangle",
      subcategories: [
        {
          id: "krov_konstrukcija",
          label: { sr: "Krovišna konstrukcija", en: "Roof structure (carpentry / steelwork)", ru: "Кровельная конструкция (стропильная / стальная)" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip krovišne konstrukcije", en: "Roof structure type", ru: "Тип кровельной конструкции" },
              importance: "required",
              options: [
                { value: "drvena_rogljaca", label: { sr: "Drvena rogljača (klasična)", en: "Traditional timber rafter roof", ru: "Деревянная стропильная (классическая)" } },
                { value: "drvena_stolica", label: { sr: "Drvena stolica (sa grednicima)", en: "Timber truss roof (purlin)", ru: "Деревянная ферма (с прогонами)" } },
                { value: "celicna", label: { sr: "Čelična krovna konstrukcija", en: "Steel roof structure", ru: "Стальная кровельная конструкция" } },
                { value: "ravni_krov_ab", label: { sr: "Ravni krov (AB ploča)", en: "Flat roof (RC slab)", ru: "Плоская кровля (ЖБ плита)" } },
              ],
            },
            {
              key: "povrsina_krova",
              kind: "area",
              label: { sr: "Površina krova (kosa površina)", en: "Roof area (pitched surface)", ru: "Площадь кровли (скатная поверхность)" },
              importance: "required",
              unit: "m²",
              predefined: [60, 80, 100, 130, 160, 200],
              unknownAllowed: true,
            },
            {
              key: "nagib",
              kind: "select",
              label: { sr: "Nagib krova", en: "Roof pitch", ru: "Уклон кровли" },
              importance: "optional",
              options: [
                { value: "blag_do15", label: { sr: "Blag (do 15°)", en: "Shallow (up to 15°)", ru: "Пологий (до 15°)" } },
                { value: "srednji_15_30", label: { sr: "Srednji (15–30°)", en: "Medium (15–30°)", ru: "Средний (15–30°)" } },
                { value: "strmiji_30_45", label: { sr: "Strmiji (30–45°)", en: "Steep (30–45°)", ru: "Крутой (30–45°)" } },
                { value: "strm_preko45", label: { sr: "Strm (> 45°)", en: "Very steep (> 45°)", ru: "Очень крутой (> 45°)" } },
              ],
            },
          ],
        },
        {
          id: "krov_pokrivac",
          label: { sr: "Krovni pokrivač", en: "Roof covering", ru: "Кровельное покрытие" },
          fields: [
            {
              key: "povrsina_krova",
              kind: "area",
              label: { sr: "Površina krova", en: "Roof area", ru: "Площадь кровли" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 160, 200],
              unknownAllowed: true,
            },
            {
              key: "pokrivac",
              kind: "select",
              label: { sr: "Tip pokrivača", en: "Covering type", ru: "Тип покрытия" },
              importance: "required",
              options: [
                { value: "crepe_glineni", label: { sr: "Glineni crep", en: "Clay tiles", ru: "Глиняная черепица" } },
                { value: "crepe_betonski", label: { sr: "Betonski crep", en: "Concrete tiles", ru: "Бетонная черепица" } },
                { value: "lim_trapezni", label: { sr: "Trapezni lim", en: "Trapezoidal metal sheet", ru: "Трапециевидный металлический лист" } },
                { value: "lim_stojecafalc", label: { sr: "Stojeća falc (premium lim)", en: "Standing seam (premium metal)", ru: "Фальцевая кровля (премиум металл)" } },
                { value: "bitumenske_sindrile", label: { sr: "Bitumenske šindre", en: "Bitumen shingles", ru: "Битумная черепица" } },
                { value: "ravni_krov_hidroizolacija", label: { sr: "Ravni krov — membrana / bitumen", en: "Flat roof — membrane / bitumen", ru: "Плоская кровля — мембрана / битум" } },
              ],
            },
            {
              key: "potkrovlje_izolacija",
              kind: "toggle",
              label: { sr: "Termoizolacija krovišta", en: "Roof thermal insulation", ru: "Теплоизоляция кровли" },
              importance: "required",
            },
            {
              key: "odvodni_sistemi",
              kind: "toggle",
              label: { sr: "Oluke i odvodne cevi", en: "Gutters and downpipes", ru: "Водостоки и водосточные трубы" },
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
      label: { sr: "Fasada i spoljašnja izolacija", en: "Facade & external insulation", ru: "Фасад и внешняя изоляция" },
      icon: "home",
      subcategories: [
        {
          id: "fasada_etics",
          exclusive: true,
          label: { sr: "Stiropor fasada (ETICS)", en: "EPS external wall insulation (ETICS)", ru: "Утепление фасада пенопластом (ETICS)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade", en: "Facade area", ru: "Площадь фасада" },
              importance: "required",
              unit: "m²",
              predefined: [100, 150, 200, 250, 300, 400],
              unknownAllowed: true,
            },
            {
              key: "debljina",
              kind: "select",
              label: { sr: "Debljina stiropora", en: "EPS thickness", ru: "Толщина пенопласта" },
              importance: "required",
              options: [
                { value: "8cm", label: { sr: "8 cm", en: "8 cm", ru: "8 см" } },
                { value: "10cm", label: { sr: "10 cm (standard)", en: "10 cm (standard)", ru: "10 см (стандарт)" } },
                { value: "15cm", label: { sr: "15 cm (energetski pasoš B)", en: "15 cm (energy class B)", ru: "15 см (энергокласс B)" } },
                { value: "20cm", label: { sr: "20 cm (pasivni standard)", en: "20 cm (passive standard)", ru: "20 см (пассивный стандарт)" } },
              ],
            },
            {
              key: "zavrsni_sloj",
              kind: "select",
              label: { sr: "Završni sloj", en: "Finish coat", ru: "Финишный слой" },
              importance: "required",
              options: [
                { value: "akrilni", label: { sr: "Akrilni malter (standard)", en: "Acrylic render (standard)", ru: "Акриловая штукатурка (стандарт)" } },
                { value: "silikatni", label: { sr: "Silikatni malter (premium)", en: "Silicate render (premium)", ru: "Силикатная штукатурка (премиум)" } },
                { value: "silikonski", label: { sr: "Silikonski malter", en: "Silicone render", ru: "Силиконовая штукатурка" } },
                { value: "obloga_kamen", label: { sr: "Kamena obloga (delom)", en: "Stone cladding (partial)", ru: "Каменная облицовка (частичная)" } },
                { value: "klinkerne_opeke", label: { sr: "Klinkerne opeke (delom)", en: "Clinker bricks (partial)", ru: "Клинкерный кирпич (частично)" } },
              ],
            },
          ],
        },
        {
          id: "fasada_malterisanje",
          exclusive: true,
          label: { sr: "Spoljašnje malterisanje (bez izolacije)", en: "External rendering (without insulation)", ru: "Внешняя штукатурка (без утепления)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade", en: "Facade area", ru: "Площадь фасада" },
              importance: "required",
              unit: "m²",
              predefined: [80, 120, 160, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "tip_maltera",
              kind: "select",
              label: { sr: "Tip maltera", en: "Render type", ru: "Тип штукатурки" },
              importance: "optional",
              options: [
                { value: "produzni_cementni", label: { sr: "Produžni cementni (klasični)", en: "Lime-cement render (classic)", ru: "Известково-цементная (классическая)" } },
                { value: "fasadni_silikatni", label: { sr: "Fasadni silikatni (završni)", en: "Silicate finish render", ru: "Силикатная финишная штукатурка" } },
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
      label: { sr: "Spoljna stolarija", en: "External joinery (windows & doors)", ru: "Внешние столярные изделия (окна и двери)" },
      icon: "door-open",
      subcategories: [
        {
          id: "stolarija_prozori",
          label: { sr: "Prozori i balkonska vrata", en: "Windows & balcony doors", ru: "Окна и балконные двери" },
          fields: [
            {
              key: "broj_prozora",
              kind: "number",
              label: { sr: "Broj prozora i balkonskih vrata", en: "Number of windows & balcony doors", ru: "Количество окон и балконных дверей" },
              importance: "required",
              unit: "kom",
              predefined: [4, 6, 8, 10, 12, 15, 20],
              unknownAllowed: true,
            },
            {
              key: "ukupna_povrsina",
              kind: "area",
              label: { sr: "Ukupna površina ostakljenja", en: "Total glazed area", ru: "Общая площадь остекления" },
              importance: "optional",
              unit: "m²",
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
                { value: "drvo_aluminijum", label: { sr: "Drvo-aluminijum", en: "Wood-aluminium", ru: "Дерево-алюминий" } },
              ],
            },
            {
              key: "staklo",
              kind: "select",
              label: { sr: "Ostakljenje", en: "Glazing", ru: "Остекление" },
              importance: "optional",
              options: [
                { value: "dvostuko", label: { sr: "Dvoslojno", en: "Double glazed", ru: "Двойное" } },
                { value: "trojstuko", label: { sr: "Troslojno (za energetsku efikasnost)", en: "Triple glazed (energy efficient)", ru: "Тройное (энергоэффективное)" } },
              ],
            },
            {
              key: "roletne",
              kind: "toggle",
              label: { sr: "Roletne", en: "Roller shutters", ru: "Рольставни" },
              importance: "optional",
            },
          ],
        },
        {
          id: "stolarija_ulazna_vrata",
          label: { sr: "Ulazna vrata", en: "Entrance door", ru: "Входная дверь" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip ulaznih vrata", en: "Entry door type", ru: "Тип входной двери" },
              importance: "required",
              options: [
                { value: "sigurnosna_celicna", label: { sr: "Sigurnosna čelična", en: "Steel security door", ru: "Стальная бронированная" } },
                { value: "aluminijum", label: { sr: "Aluminijumska", en: "Aluminium", ru: "Алюминиевая" } },
                { value: "pvc", label: { sr: "PVC", en: "PVC", ru: "ПВХ" } },
                { value: "drvo", label: { sr: "Masivno drvo", en: "Solid wood", ru: "Массив дерева" } },
              ],
            },
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj ulaznih vrata", en: "Number of entrance doors", ru: "Количество входных дверей" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2],
              unknownAllowed: false,
            },
          ],
        },
        {
          id: "stolarija_garazna_vrata",
          label: { sr: "Garažna vrata", en: "Garage door", ru: "Гаражные ворота" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip garažnih vrata", en: "Garage door type", ru: "Тип гаражных ворот" },
              importance: "required",
              options: [
                { value: "sekcijska", label: { sr: "Sekcijska (uvlačeća)", en: "Sectional (overhead)", ru: "Секционные (подъёмные)" } },
                { value: "krilna", label: { sr: "Krilna (dupla)", en: "Side-hung (double leaf)", ru: "Распашные (двустворчатые)" } },
                { value: "klizna", label: { sr: "Klizna", en: "Sliding", ru: "Раздвижные" } },
              ],
            },
            {
              key: "motor",
              kind: "toggle",
              label: { sr: "Automatski pogon (motor)", en: "Automatic drive (motor)", ru: "Автоматический привод (мотор)" },
              importance: "optional",
            },
            {
              key: "broj",
              kind: "number",
              label: { sr: "Broj garaža", en: "Number of garages", ru: "Количество гаражей" },
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
      label: { sr: "Elektroinstalacije", en: "Electrical installations", ru: "Электрические установки" },
      icon: "zap",
      subcategories: [
        {
          id: "elektro_kompletna",
          label: { sr: "Kompletna elektroinstalacija", en: "Full electrical installation", ru: "Полная электроустановка" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area", ru: "Общая площадь здания" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "tip_razvodne_table",
              kind: "select",
              label: { sr: "Razvodna tabla", en: "Consumer unit", ru: "Распределительный щит" },
              importance: "optional",
              options: [
                { value: "standardna", label: { sr: "Standardna (jednofazna)", en: "Standard (single-phase)", ru: "Стандартный (однофазный)" } },
                { value: "trofazna", label: { sr: "Trofazna", en: "Three-phase", ru: "Трёхфазный" } },
              ],
            },
            {
              key: "smarthome_priprema",
              kind: "toggle",
              label: { sr: "Priprema infrastrukture za smart home", en: "Smart home cable infrastructure prep", ru: "Подготовка инфраструктуры для умного дома" },
              importance: "optional",
            },
            {
              key: "solarna_priprema",
              kind: "toggle",
              label: { sr: "Priprema za solarni sistem (kablovi do krova)", en: "Solar system cable prep (roof cables)", ru: "Подготовка для солнечной системы (кабели на крышу)" },
              importance: "optional",
            },
            {
              key: "punjac_ev",
              kind: "toggle",
              label: { sr: "Priprema za punjač EV vozila", en: "EV charger point prep", ru: "Подготовка для зарядки электромобиля" },
              importance: "optional",
            },
          ],
        },
        {
          id: "elektro_slaba_struja",
          label: { sr: "Slaba struja (IT, alarmni, AV sistemi)", en: "Low voltage (IT, alarm, AV systems)", ru: "Слаботочные системы (IT, сигнализация, AV)" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Sistemi", en: "Systems", ru: "Системы" },
              importance: "required",
              options: [
                { value: "mreza_it", label: { sr: "LAN mreža (Cat6/Cat7)", en: "LAN network (Cat6/Cat7)", ru: "LAN сеть (Cat6/Cat7)" } },
                { value: "alarm", label: { sr: "Alarmni sistem", en: "Burglar alarm", ru: "Охранная сигнализация" } },
                { value: "video_nadzor", label: { sr: "Video nadzor (CCTV)", en: "CCTV", ru: "Видеонаблюдение (CCTV)" } },
                { value: "interfonski", label: { sr: "Interfon / video portir", en: "Video intercom / door entry", ru: "Видеодомофон / система доступа" } },
                { value: "audio_distribucija", label: { sr: "Audio distribucija", en: "AV distribution", ru: "Аудио распределение" } },
                { value: "tv_antena", label: { sr: "TV / SAT antenska instalacija", en: "TV / SAT aerial installation", ru: "ТВ / спутниковая антенная установка" } },
              ],
            },
          ],
        },
        {
          id: "elektro_solar",
          label: { sr: "Solarni sistem (fotonaponski)", en: "Solar PV system", ru: "Солнечная фотоэлектрическая система" },
          fields: [
            {
              key: "snaga_kwp",
              kind: "number",
              label: { sr: "Snaga sistema (kWp)", en: "System capacity (kWp)", ru: "Мощность системы (кВтп)" },
              importance: "required",
              unit: "kWp",
              predefined: [3, 5, 6, 8, 10, 12, 15],
              unknownAllowed: true,
            },
            {
              key: "baterija",
              kind: "toggle",
              label: { sr: "Baterija za akumulaciju energije", en: "Battery storage", ru: "Аккумуляторный накопитель энергии" },
              importance: "optional",
            },
            {
              key: "on_off_grid",
              kind: "select",
              label: { sr: "Vrsta sistema", en: "System type", ru: "Тип системы" },
              importance: "optional",
              options: [
                { value: "on_grid", label: { sr: "On-grid (vezano za mrežu)", en: "On-grid (grid-tied)", ru: "Сетевая (On-grid)" } },
                { value: "hibridni", label: { sr: "Hibridni (mreža + baterija)", en: "Hybrid (grid + battery)", ru: "Гибридная (сеть + аккумулятор)" } },
                { value: "off_grid", label: { sr: "Off-grid (autonomni)", en: "Off-grid (autonomous)", ru: "Автономная (Off-grid)" } },
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
      label: { sr: "ViK instalacije", en: "Plumbing & drainage", ru: "Водопровод и канализация" },
      icon: "droplets",
      subcategories: [
        {
          id: "vik_kompletna",
          label: { sr: "Kompletna ViK instalacija", en: "Full plumbing & drainage installation", ru: "Полная установка водопровода и канализации" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area", ru: "Общая площадь здания" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "broj_kupatila",
              kind: "number",
              label: { sr: "Broj kupatila / WC-a", en: "Number of bathrooms / WCs", ru: "Количество ванных / WC" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
            {
              key: "materijal_cevi",
              kind: "select",
              label: { sr: "Materijal cevi", en: "Pipe material", ru: "Материал труб" },
              importance: "optional",
              options: [
                { value: "pex", label: { sr: "PEX (fleksibilne, preporučeno)", en: "PEX (flexible, recommended)", ru: "PEX (гибкие, рекомендуется)" } },
                { value: "pp", label: { sr: "Polipropilen (PP)", en: "Polypropylene (PP)", ru: "Полипропилен (PP)" } },
                { value: "bakar", label: { sr: "Bakar (premium)", en: "Copper (premium)", ru: "Медь (премиум)" } },
              ],
            },
            {
              key: "septička_jama",
              kind: "toggle",
              label: { sr: "Septička jama / prečistač (ako nema javne kanalizacije)", en: "Septic tank / treatment (if no public sewer)", ru: "Септик / очистное сооружение (если нет централизованной канализации)" },
              importance: "optional",
            },
            {
              key: "cisterna_kisnicu",
              kind: "toggle",
              label: { sr: "Cisterna za kišnicu", en: "Rainwater harvesting tank", ru: "Цистерна для дождевой воды" },
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
      label: { sr: "Grejanje i hlađenje", en: "Heating & cooling", ru: "Отопление и охлаждение" },
      icon: "flame",
      subcategories: [
        {
          id: "grejanje_kotao",
          label: { sr: "Kotao (centralno grejanje)", en: "Boiler (central heating)", ru: "Котёл (центральное отопление)" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip kotla", en: "Boiler type", ru: "Тип котла" },
              importance: "required",
              options: [
                { value: "gas_kondenzacioni", label: { sr: "Gasni kondenzacioni", en: "Gas condensing", ru: "Газовый конденсационный" } },
                { value: "pelet", label: { sr: "Peletni", en: "Pellet", ru: "Пеллетный" } },
                { value: "toplotna_pumpa", label: { sr: "Toplotna pumpa vazduh-voda", en: "Air-to-water heat pump", ru: "Тепловой насос воздух-вода" } },
                { value: "el_kotao", label: { sr: "Električni kotao", en: "Electric boiler", ru: "Электрический котёл" } },
                { value: "drva_ugalj", label: { sr: "Na drva/ugalj", en: "Wood/coal", ru: "На дровах/угле" } },
              ],
            },
            {
              key: "distribucija",
              kind: "select",
              label: { sr: "Distribucija toplote", en: "Heat distribution", ru: "Распределение тепла" },
              importance: "required",
              options: [
                { value: "radijatori", label: { sr: "Radijatori", en: "Radiators", ru: "Радиаторы" } },
                { value: "podno_grejanje", label: { sr: "Podno grejanje", en: "Underfloor heating", ru: "Тёплый пол" } },
                { value: "kombinirano", label: { sr: "Kombinirano (radijatori + podno)", en: "Combined (radiators + UFH)", ru: "Комбинированное (радиаторы + тёплый пол)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina za grejanje", en: "Heated area", ru: "Отапливаемая площадь" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "grejanje_klima",
          label: { sr: "Klima uređaji (split sistem)", en: "Air conditioning (split units)", ru: "Кондиционеры (сплит-системы)" },
          fields: [
            {
              key: "broj_unutrasnjih",
              kind: "number",
              label: { sr: "Broj unutrašnjih jedinica", en: "Number of indoor units", ru: "Количество внутренних блоков" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6],
              unknownAllowed: true,
            },
            {
              key: "sistem",
              kind: "select",
              label: { sr: "Sistem", en: "System", ru: "Система" },
              importance: "optional",
              options: [
                { value: "mono_split", label: { sr: "Mono-split jedince", en: "Individual mono-splits", ru: "Индивидуальные моно-сплиты" } },
                { value: "multi_split", label: { sr: "Multi-split (jedna spoljna, više unutrašnjih)", en: "Multi-split (one outdoor, multiple indoor)", ru: "Мульти-сплит (один внешний, несколько внутренних)" } },
                { value: "vrf_vrv", label: { sr: "VRF/VRV sistem (stambeno-poslovni)", en: "VRF/VRV (commercial-residential)", ru: "VRF/VRV система (жилое-коммерческое)" } },
              ],
            },
          ],
        },
        {
          id: "grejanje_rekuperacija",
          label: { sr: "Mehanička ventilacija s rekuperacijom (MVR)", en: "MVHR (mechanical ventilation with heat recovery)", ru: "Механическая вентиляция с рекуперацией тепла (МВРТ)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "BRP objekta", en: "Gross floor area", ru: "Общая площадь здания" },
              importance: "required",
              unit: "m²",
              predefined: [80, 120, 150, 200, 250],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip sistema", en: "System type", ru: "Тип системы" },
              importance: "optional",
              options: [
                { value: "centralni", label: { sr: "Centralni (jedan uređaj, kanali)", en: "Central (one unit, ductwork)", ru: "Центральная (один блок, воздуховоды)" } },
                { value: "decentralizovani", label: { sr: "Decentralizovani (po sobama)", en: "Decentralised (room units)", ru: "Децентрализованная (поккомнатно)" } },
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
      label: { sr: "Unutrašnje završne radove", en: "Internal fit-out & finishes", ru: "Внутренняя отделка" },
      icon: "paintbrush",
      subcategories: [
        {
          id: "zavrse_malterisanje",
          label: { sr: "Unutrašnje malterisanje i gletovanje", en: "Internal plastering & skim coating", ru: "Внутренняя штукатурка и шпаклёвка" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Ukupna površina zidova i plafona", en: "Total wall & ceiling area", ru: "Общая площадь стен и потолков" },
              importance: "required",
              unit: "m²",
              predefined: [200, 300, 400, 500, 600, 800],
              unknownAllowed: true,
              help: {
                sr: "Gruba procena: BRP × 4 za prosečan stan/kuću.",
                en: "Quick estimate: GFA × 4 for an average house.",
                ru: "Приблизительная оценка: общая площадь × 4 для среднего дома.",
              },
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip maltera", en: "Plaster type", ru: "Тип штукатурки" },
              importance: "optional",
              options: [
                { value: "produzni_cementni", label: { sr: "Produžni cementni (klasični)", en: "Lime-cement (classic)", ru: "Известково-цементная (классическая)" } },
                { value: "gips_masinski", label: { sr: "Mašinski gips malter (brži)", en: "Machine-applied gypsum plaster (faster)", ru: "Машинная гипсовая штукатурка (быстрее)" } },
              ],
            },
          ],
        },
        {
          id: "zavrse_podovi",
          label: { sr: "Podovi", en: "Flooring", ru: "Полы" },
          fields: [
            {
              key: "raspodela",
              kind: "chips",
              label: { sr: "Tipovi podova po zonama", en: "Floor types by zone", ru: "Типы полов по зонам" },
              importance: "required",
              options: [
                { value: "parket_sobe", label: { sr: "Parket (sobe, dnevna)", en: "Parquet/hardwood (rooms, living)", ru: "Паркет (комнаты, гостиная)" } },
                { value: "keramika_kup_kuh", label: { sr: "Keramika (kupatilo, kuhinja, hodnik)", en: "Tiles (bathroom, kitchen, hall)", ru: "Плитка (ванная, кухня, коридор)" } },
                { value: "laminat", label: { sr: "Laminat", en: "Laminate", ru: "Ламинат" } },
                { value: "podno_grejanje_sve", label: { sr: "Sve površine podno grejanje", en: "All areas: underfloor heating", ru: "Все зоны: тёплый пол" } },
              ],
            },
            {
              key: "povrsina_ukupna",
              kind: "area",
              label: { sr: "Ukupna površina podova", en: "Total floor area", ru: "Общая площадь полов" },
              importance: "required",
              unit: "m²",
              predefined: [80, 100, 120, 150, 200, 250],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "zavrse_krecenje",
          label: { sr: "Krečenje i bojenje", en: "Painting & decorating", ru: "Покраска и декорирование" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina zidova i plafona", en: "Wall & ceiling area", ru: "Площадь стен и потолков" },
              importance: "required",
              unit: "m²",
              predefined: [200, 300, 400, 500, 600, 800],
              unknownAllowed: true,
            },
            {
              key: "priprema",
              kind: "select",
              label: { sr: "Priprema površine", en: "Surface preparation", ru: "Подготовка поверхности" },
              importance: "required",
              options: [
                { value: "gletovanje_bojenje", label: { sr: "Gletovanje + bojenje (standard)", en: "Skim + paint (standard)", ru: "Шпаклёвка + покраска (стандарт)" } },
                { value: "samo_bojenje", label: { sr: "Samo bojenje (površina glatka)", en: "Paint only (smooth surface)", ru: "Только покраска (гладкая поверхность)" } },
              ],
            },
          ],
        },
        {
          id: "zavrse_unutrasnja_stolarija",
          label: { sr: "Unutrašnja stolarija (vrata)", en: "Internal joinery (doors)", ru: "Внутренние столярные изделия (двери)" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj unutrašnjih vrata", en: "Number of internal doors", ru: "Количество межкомнатных дверей" },
              importance: "required",
              unit: "kom",
              predefined: [4, 5, 6, 7, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip vrata", en: "Door style", ru: "Стиль двери" },
              importance: "optional",
              options: [
                { value: "klasicna", label: { sr: "Klasična krilna", en: "Classic swing door", ru: "Классическая распашная" } },
                { value: "klizna", label: { sr: "Klizna (džepna)", en: "Sliding (pocket)", ru: "Раздвижная (карманная)" } },
                { value: "flush_laminat", label: { sr: "Plosnata (flush) — laminat", en: "Flush — laminate", ru: "Плоская (flush) — ламинат" } },
              ],
            },
          ],
        },
      ],
    },

  ],
};
