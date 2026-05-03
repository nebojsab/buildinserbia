import type { WizardProjectTree } from "./types";

export const dvoristTree: WizardProjectTree = {
  projectType: "yard",
  label: { sr: "Dvorište", en: "Yard / garden", ru: "Двор / сад" },
  categories: [

    // ─────────────────────────────────────────────────────────
    // 1. NIVELACIJA I PRIPREMA TERENA
    // ─────────────────────────────────────────────────────────
    {
      id: "priprema_terena",
      label: { sr: "Nivelacija i priprema terena", en: "Levelling & ground preparation", ru: "Планировка и подготовка территории" },
      icon: "layers",
      subcategories: [
        {
          id: "teren_nivelacija",
          label: { sr: "Nivelacija dvorišta", en: "Yard levelling", ru: "Планировка двора" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina dvorišta", en: "Yard area", ru: "Площадь двора" },
              importance: "required",
              unit: "m²",
              predefined: [50, 100, 150, 200, 300, 500],
              unknownAllowed: true,
            },
            {
              key: "nagib",
              kind: "select",
              label: { sr: "Konfiguracija terena", en: "Terrain configuration", ru: "Конфигурация рельефа" },
              importance: "required",
              options: [
                { value: "ravan", label: { sr: "Ravan teren (minimalna nivelacija)", en: "Flat (minimal levelling)", ru: "Ровный рельеф (минимальная планировка)" } },
                { value: "blagi_nagib", label: { sr: "Blagi nagib (do 5%)", en: "Gentle slope (up to 5%)", ru: "Лёгкий уклон (до 5%)" } },
                { value: "strmi_nagib", label: { sr: "Strmi nagib (> 5%) — potporni zidovi", en: "Steep slope (> 5%) — retaining walls needed", ru: "Крутой уклон (> 5%) — нужны подпорные стены" } },
              ],
            },
            {
              key: "iskop_nasip",
              kind: "select",
              label: { sr: "Iskop ili nasipanje", en: "Cut or fill", ru: "Выемка или насыпь" },
              importance: "optional",
              options: [
                { value: "iskop", label: { sr: "Iskop i odvoz viška zemlje", en: "Excavate and remove surplus spoil", ru: "Выемка и вывоз лишнего грунта" } },
                { value: "nasipanje", label: { sr: "Nasipanje (dovoz plodne ili tehničke zemlje)", en: "Fill (import topsoil or sub-base)", ru: "Насыпь (завоз плодородного или технического грунта)" } },
                { value: "kombinovano", label: { sr: "Kombinovano — raskopavanje i preraspoređivanje", en: "Combined — cut and redistribute", ru: "Комбинированное — выемка и перераспределение" } },
              ],
            },
            {
              key: "potporni_zidovi",
              kind: "toggle",
              label: { sr: "Izgradnja potpornih zidova", en: "Retaining walls", ru: "Строительство подпорных стен" },
              importance: "optional",
            },
            {
              key: "potporni_materijal",
              kind: "select",
              label: { sr: "Materijal potpornih zidova", en: "Retaining wall material", ru: "Материал подпорных стен" },
              importance: "optional",
              options: [
                { value: "ab_zid", label: { sr: "Armirani beton", en: "Reinforced concrete", ru: "Армированный бетон" } },
                { value: "gabioni", label: { sr: "Gabioni (kamena korpa)", en: "Gabion baskets", ru: "Габионы (каменные корзины)" } },
                { value: "betonski_blokovi", label: { sr: "Betonski blokovi (palisade)", en: "Concrete block / palisade", ru: "Бетонные блоки / палисад" } },
                { value: "drvene_grede", label: { sr: "Drvene grede (rustika)", en: "Timber sleepers (rustic)", ru: "Деревянные шпалы (рустик)" } },
              ],
              showWhen: { potporni_zidovi: true },
            },
          ],
        },
        {
          id: "teren_drenaza",
          label: { sr: "Drenažni sistem i odvod kišnice", en: "Drainage & stormwater management", ru: "Дренажная система и отвод дождевых вод" },
          fields: [
            {
              key: "tip",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "drenazne_cevi", label: { sr: "Drenažne cevi (perforisan dren)", en: "Perforated drain pipes", ru: "Дренажные трубы (перфорированные)" } },
                { value: "slivnici", label: { sr: "Slivnici i šahtovi", en: "Drain inlets & inspection chambers", ru: "Дождеприёмники и ревизионные колодцы" } },
                { value: "francesa_drenaza", label: { sr: "Francuska drenaža (šljunčani rov)", en: "French drain (gravel trench)", ru: "Французский дренаж (гравийная траншея)" } },
                { value: "cisterna_kisnicu", label: { sr: "Cisterna za prikupljanje kišnice", en: "Rainwater harvesting tank", ru: "Цистерна для сбора дождевой воды" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina za dreniranje", en: "Area to drain", ru: "Площадь для дренирования" },
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
      label: { sr: "Staze, terase i popločavanje", en: "Paths, terraces & paving", ru: "Дорожки, террасы и мощение" },
      icon: "square",
      subcategories: [
        {
          id: "terasa",
          label: { sr: "Terasa / trem", en: "Terrace / patio", ru: "Терраса / навес" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina terase", en: "Terrace area", ru: "Площадь террасы" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 30, 40, 50],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal terase", en: "Terrace material", ru: "Материал террасы" },
              importance: "required",
              options: [
                { value: "beton_stampani", label: { sr: "Štampani / dekorativni beton", en: "Stamped / decorative concrete", ru: "Штампованный / декоративный бетон" } },
                { value: "betonske_ploce", label: { sr: "Betonske ploče (šajba)", en: "Concrete paving slabs", ru: "Бетонные плиты" } },
                { value: "granitne_kocke", label: { sr: "Granitne kocke / granit ploče", en: "Granite setts / granite slabs", ru: "Гранитная брусчатка / гранитные плиты" } },
                { value: "keramika_spoljna", label: { sr: "Spoljašnja keramika (Frost-proof)", en: "External tiles (frost-proof)", ru: "Наружная плитка (морозостойкая)" } },
                { value: "drvo_spoljna", label: { sr: "Drvena terasa (Thermowood / Bangkirai)", en: "Timber decking (Thermowood / Bangkirai)", ru: "Деревянный настил (термодерево / Bangkirai)" } },
                { value: "wpc_decking", label: { sr: "WPC (drvo-plastika) decking", en: "WPC (wood-plastic composite) decking", ru: "Декинг WPC (древесно-пластиковый композит)" } },
                { value: "prirodni_kamen", label: { sr: "Prirodni kamen (krečnjak, pješčar)", en: "Natural stone (limestone, sandstone)", ru: "Натуральный камень (известняк, песчаник)" } },
              ],
            },
            {
              key: "krovica_nadstresnica",
              kind: "toggle",
              label: { sr: "Nadstrešnica / pergola iznad terase", en: "Canopy / pergola over terrace", ru: "Навес / pergola над террасой" },
              importance: "optional",
            },
          ],
        },
        {
          id: "staze_setniste",
          label: { sr: "Staze i šetišta", en: "Garden paths & walkways", ru: "Садовые дорожки и тропинки" },
          fields: [
            {
              key: "duzina",
              kind: "length",
              label: { sr: "Ukupna dužina staza", en: "Total path length", ru: "Общая длина дорожек" },
              importance: "required",
              unit: "m",
              predefined: [10, 20, 30, 40, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "sirina",
              kind: "select",
              label: { sr: "Širina staze", en: "Path width", ru: "Ширина дорожки" },
              importance: "optional",
              options: [
                { value: "80cm", label: { sr: "80 cm (prolazna)", en: "80 cm (single passage)", ru: "80 см (одиночный проход)" } },
                { value: "100cm", label: { sr: "100 cm (standard)", en: "100 cm (standard)", ru: "100 см (стандарт)" } },
                { value: "120cm", label: { sr: "120 cm i više (šira)", en: "120 cm + (wide)", ru: "120 см и более (широкая)" } },
              ],
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal staze", en: "Path material", ru: "Материал дорожки" },
              importance: "required",
              options: [
                { value: "betonske_ploce", label: { sr: "Betonske ploče", en: "Concrete slabs", ru: "Бетонные плиты" } },
                { value: "sitna_oblutka_pesak", label: { sr: "Sitni oblutci / pesak", en: "Gravel / pea shingle", ru: "Мелкий гравий / гравийный отсев" } },
                { value: "granitne_kocke", label: { sr: "Granitne kocke", en: "Granite setts", ru: "Гранитная брусчатка" } },
                { value: "beton_stampani", label: { sr: "Štampani beton", en: "Stamped concrete", ru: "Штампованный бетон" } },
                { value: "drvo_podloge", label: { sr: "Drvene podloge (stepping pads)", en: "Timber stepping pads", ru: "Деревянные подступенки (stepping pads)" } },
              ],
            },
          ],
        },
        {
          id: "staze_parking",
          label: { sr: "Parking / garage pad", en: "Driveway / parking area", ru: "Парковка / подъездная площадка" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina parkinga / pristupne staze", en: "Driveway / parking area", ru: "Площадь парковки / подъездной дорожки" },
              importance: "required",
              unit: "m²",
              predefined: [15, 20, 30, 40, 50, 60],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material", ru: "Материал" },
              importance: "required",
              options: [
                { value: "beton", label: { sr: "Beton (armiran)", en: "Reinforced concrete", ru: "Армированный бетон" } },
                { value: "asfalt", label: { sr: "Asfalt", en: "Asphalt", ru: "Асфальт" } },
                { value: "granitne_kocke", label: { sr: "Granitne kocke", en: "Granite setts", ru: "Гранитная брусчатка" } },
                { value: "beton_kocke", label: { sr: "Betonski opločnik", en: "Concrete block paving (CBP)", ru: "Бетонная тротуарная плитка" } },
                { value: "travne_resetke", label: { sr: "Travne rešetke (gazon blok)", en: "Grass reinforcement mesh / grid", ru: "Газонные решётки (газонный блок)" } },
              ],
            },
            {
              key: "broj_mesta",
              kind: "number",
              label: { sr: "Broj parking mesta", en: "Number of parking spaces", ru: "Количество парковочных мест" },
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
      label: { sr: "Zelene površine", en: "Lawn & planting", ru: "Зелёные насаждения" },
      icon: "leaf",
      subcategories: [
        {
          id: "travnjak",
          label: { sr: "Travnjak", en: "Lawn", ru: "Газон" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina travnjaka", en: "Lawn area", ru: "Площадь газона" },
              importance: "required",
              unit: "m²",
              predefined: [30, 50, 80, 100, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip travnjaka", en: "Lawn type", ru: "Тип газона" },
              importance: "required",
              options: [
                { value: "setva_semena", label: { sr: "Setva semena (jeftiniji, duže čekanje)", en: "Seeded lawn (cheaper, longer wait)", ru: "Посев семян (дешевле, дольше ждать)" } },
                { value: "roll_buseni", label: { sr: "Rolni buseni (instant travnjak)", en: "Turf rolls (instant lawn)", ru: "Рулонный газон (готовый газон)" } },
              ],
            },
            {
              key: "priprema_tla",
              kind: "select",
              label: { sr: "Priprema tla", en: "Soil preparation", ru: "Подготовка почвы" },
              importance: "required",
              options: [
                { value: "frezanje_dosipanje", label: { sr: "Frezanje + dosipanje plodnog supstrata", en: "Rotavate + topsoil dressing", ru: "Фрезеровка + подсыпка плодородного субстрата" } },
                { value: "samo_setva", label: { sr: "Samo setva (tlo u dobrom stanju)", en: "Seed only (soil already good)", ru: "Только посев (почва в хорошем состоянии)" } },
                { value: "kompletan_supstrat", label: { sr: "Kompletan sloj plodne zemlje (10–15 cm)", en: "Full topsoil layer (10–15 cm)", ru: "Полный слой плодородного грунта (10–15 см)" } },
              ],
            },
            {
              key: "automatsko_navodnjavanje",
              kind: "toggle",
              label: { sr: "Automatsko navodnjavanje travnjaka", en: "Automatic lawn irrigation", ru: "Автоматический полив газона" },
              importance: "optional",
            },
          ],
        },
        {
          id: "zelenilo_sadnja",
          label: { sr: "Sadnja drveća, živice i cvеtnih lejа", en: "Tree & hedge planting, flower beds", ru: "Посадка деревьев, живой изгороди и клумб" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se sadi", en: "What is being planted", ru: "Что высаживается" },
              importance: "required",
              options: [
                { value: "drvoredi_stabla", label: { sr: "Drvoredi / ukrasna stabla", en: "Trees / ornamental trees", ru: "Аллеи / декоративные деревья" } },
                { value: "ziva_ograda", label: { sr: "Živa ograda (tuja, lovor, šimšir...)", en: "Hedge (thuja, laurel, box...)", ru: "Живая изгородь (туя, лавр, самшит...)" } },
                { value: "cvetne_leje", label: { sr: "Cvetne leje / višegodišnje biljke", en: "Flower beds / perennials", ru: "Клумбы / многолетние растения" } },
                { value: "voce", label: { sr: "Voćke (jabuka, kruška, šljiva...)", en: "Fruit trees", ru: "Плодовые деревья (яблоня, груша, слива...)" } },
                { value: "penjalice", label: { sr: "Penjalice (bršljan, wisteria...)", en: "Climbing plants (ivy, wisteria...)", ru: "Вьющиеся растения (плющ, глициния...)" } },
              ],
            },
            {
              key: "projekt_hortikultura",
              kind: "toggle",
              label: { sr: "Potreban projekt hortikulturnog uređenja", en: "Landscape design plan required", ru: "Требуется проект ландшафтного дизайна" },
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
      label: { sr: "Ograde i kapije", en: "Fencing & gates", ru: "Заборы и ворота" },
      icon: "shield",
      subcategories: [
        {
          id: "ograda_ulicna",
          label: { sr: "Ulična ograda", en: "Street-facing fence", ru: "Уличный забор" },
          fields: [
            {
              key: "duzina",
              kind: "length",
              label: { sr: "Dužina ulične ograde", en: "Street fence length", ru: "Длина уличного забора" },
              importance: "required",
              unit: "m",
              predefined: [5, 10, 15, 20, 30, 40],
              unknownAllowed: true,
            },
            {
              key: "visina",
              kind: "select",
              label: { sr: "Visina ograde", en: "Fence height", ru: "Высота забора" },
              importance: "required",
              options: [
                { value: "080", label: { sr: "80 cm", en: "80 cm", ru: "80 см" } },
                { value: "100", label: { sr: "100 cm", en: "100 cm", ru: "100 см" } },
                { value: "120", label: { sr: "120 cm", en: "120 cm", ru: "120 см" } },
                { value: "150", label: { sr: "150 cm", en: "150 cm", ru: "150 см" } },
                { value: "180", label: { sr: "180 cm", en: "180 cm", ru: "180 см" } },
                { value: "200", label: { sr: "200 cm", en: "200 cm", ru: "200 см" } },
              ],
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material", ru: "Материал" },
              importance: "required",
              options: [
                { value: "beton_stubovi_mreza", label: { sr: "Betonski stubovi + žičana mreža (ekonomična)", en: "Concrete posts + wire mesh (economical)", ru: "Бетонные столбы + сетка (экономичный вариант)" } },
                { value: "celicni_profili", label: { sr: "Čelični profili (cevi + horizontale)", en: "Steel profiles (tubes + horizontals)", ru: "Стальные профили (трубы + горизонтали)" } },
                { value: "kovano_gvozdje", label: { sr: "Kovano gvožđe (ukrasno)", en: "Wrought iron (ornamental)", ru: "Кованое железо (декоративное)" } },
                { value: "beton_puna_ograda", label: { sr: "Puna betonska / AB ograda", en: "Solid concrete / RC fence", ru: "Сплошной бетонный / ЖБ забор" } },
                { value: "zidana_ograda", label: { sr: "Zidana ograda (opeka/blok)", en: "Masonry fence (brick/block)", ru: "Каменный забор (кирпич/блок)" } },
                { value: "drvo", label: { sr: "Drvena ograda (letvice / taraba)", en: "Timber fence (picket / close-board)", ru: "Деревянный забор (штакетник / сплошной)" } },
                { value: "kompozitna_wpc", label: { sr: "Kompozitna WPC ograda", en: "Composite WPC fence", ru: "Забор из WPC композита" } },
              ],
            },
            {
              key: "temelj_temenice",
              kind: "toggle",
              label: { sr: "Betonski temelj (temenica) ispod ograde", en: "Concrete foundation strip under fence", ru: "Бетонный ленточный фундамент под забором" },
              importance: "optional",
            },
          ],
        },
        {
          id: "ograda_susedska",
          label: { sr: "Susedska ograda (unutrašnja parcela)", en: "Boundary fence (between properties)", ru: "Забор между участками" },
          fields: [
            {
              key: "duzina",
              kind: "length",
              label: { sr: "Dužina susedske ograde", en: "Boundary fence length", ru: "Длина забора между участками" },
              importance: "required",
              unit: "m",
              predefined: [10, 20, 30, 40, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material", ru: "Материал" },
              importance: "required",
              options: [
                { value: "zicana_mreza", label: { sr: "Žičana mreža sa stubovima", en: "Chain-link / wire mesh with posts", ru: "Сетка-рабица со столбами" } },
                { value: "drvo_letvice", label: { sr: "Drvene letvice / taraba", en: "Timber close-board / picket", ru: "Деревянный штакетник / сплошной" } },
                { value: "wpc", label: { sr: "WPC kompozitna", en: "WPC composite", ru: "WPC композит" } },
                { value: "ziva_ograda", label: { sr: "Živa ograda (bilje)", en: "Hedge (planted)", ru: "Живая изгородь (растения)" } },
              ],
            },
          ],
        },
        {
          id: "kapija",
          label: { sr: "Kapija i kapica (ulaz u dvorište)", en: "Gate & pedestrian wicket", ru: "Ворота и калитка (въезд во двор)" },
          fields: [
            {
              key: "tip_kapije",
              kind: "chips",
              label: { sr: "Tip ulaza", en: "Entry type", ru: "Тип въезда" },
              importance: "required",
              options: [
                { value: "dvokrilna_vozila", label: { sr: "Dvokrilna kapija (vozila)", en: "Double gate (vehicles)", ru: "Двустворчатые ворота (для транспорта)" } },
                { value: "klizna_kapija", label: { sr: "Klizna kapija (vozila)", en: "Sliding gate (vehicles)", ru: "Откатные ворота (для транспорта)" } },
                { value: "kapica_pesaci", label: { sr: "Kapica za pešake", en: "Pedestrian wicket gate", ru: "Калитка для пешеходов" } },
              ],
            },
            {
              key: "automatika",
              kind: "toggle",
              label: { sr: "Automatski pogon kapije (motor + daljinac)", en: "Automated gate (motor + remote)", ru: "Автоматический привод ворот (мотор + пульт)" },
              importance: "optional",
            },
            {
              key: "interfonska_kamera",
              kind: "toggle",
              label: { sr: "Ugradnja video interfona na kapiji", en: "Video intercom at gate", ru: "Установка видеодомофона на воротах" },
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
      label: { sr: "Navodnjavanje", en: "Irrigation", ru: "Полив / орошение" },
      icon: "droplets",
      subcategories: [
        {
          id: "nav_automatski",
          label: { sr: "Automatski sistem navodnjavanja", en: "Automatic irrigation system", ru: "Автоматическая система полива" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Ukupna površina za navodnjavanje", en: "Total area to irrigate", ru: "Общая площадь для орошения" },
              importance: "required",
              unit: "m²",
              predefined: [50, 100, 150, 200, 300, 500],
              unknownAllowed: true,
            },
            {
              key: "zone",
              kind: "chips",
              label: { sr: "Zone", en: "Zones", ru: "Зоны" },
              importance: "optional",
              options: [
                { value: "travnjak", label: { sr: "Travnjak (sprinkleri)", en: "Lawn (sprinklers)", ru: "Газон (дождеватели)" } },
                { value: "leje_kapaljke", label: { sr: "Leje / zelenilo (kapajuće cevi)", en: "Beds / shrubs (drip line)", ru: "Клумбы / кустарники (капельный полив)" } },
                { value: "vocnjak", label: { sr: "Voćnjak", en: "Orchard", ru: "Фруктовый сад" } },
                { value: "povrtnjak", label: { sr: "Povrtnjak / bašta", en: "Vegetable garden", ru: "Огород / сад" } },
              ],
            },
            {
              key: "vodni_izvor",
              kind: "select",
              label: { sr: "Izvor vode", en: "Water source", ru: "Источник воды" },
              importance: "optional",
              options: [
                { value: "vodovodna_mreza", label: { sr: "Vodovodnа mreža", en: "Mains water", ru: "Водопроводная сеть" } },
                { value: "bunar", label: { sr: "Bunar / bušotina", en: "Well / borehole", ru: "Колодец / скважина" } },
                { value: "cisterna_kisnicu", label: { sr: "Cisterna kišnice", en: "Rainwater harvesting tank", ru: "Цистерна для дождевой воды" } },
              ],
            },
            {
              key: "kontroler_smart",
              kind: "toggle",
              label: { sr: "Smart kontroler (WiFi, vremenski senzor)", en: "Smart controller (WiFi, weather sensor)", ru: "Умный контроллер (WiFi, датчик погоды)" },
              importance: "optional",
            },
          ],
        },
        {
          id: "nav_bunar",
          label: { sr: "Bušenje bunara / plitki bunar", en: "Well / borehole drilling", ru: "Бурение скважины / неглубокий колодец" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip bunara", en: "Well type", ru: "Тип колодца" },
              importance: "required",
              options: [
                { value: "plitki_kopani", label: { sr: "Plitki kopani bunar (do 10 m)", en: "Shallow dug well (up to 10 m)", ru: "Мелкий копаный колодец (до 10 м)" } },
                { value: "busotina", label: { sr: "Bušotina (arteski, > 20 m)", en: "Borehole (artesian, > 20 m)", ru: "Скважина (артезианская, > 20 м)" } },
              ],
            },
            {
              key: "dubina",
              kind: "number",
              label: { sr: "Procenjena dubina (m)", en: "Estimated depth (m)", ru: "Ориентировочная глубина (м)" },
              importance: "optional",
              unit: "m",
              predefined: [5, 8, 10, 15, 20, 30, 50],
              unknownAllowed: true,
            },
            {
              key: "pumpa",
              kind: "toggle",
              label: { sr: "Ugradnja pumpe i hidroforskog sistema", en: "Install pump & pressure system", ru: "Установка насоса и гидрофорной системы" },
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
      label: { sr: "Dvorišna rasveta", en: "Outdoor lighting", ru: "Наружное освещение двора" },
      icon: "sun",
      subcategories: [
        {
          id: "rasveta_dvorisna",
          label: { sr: "Dvorišna rasveta (tačke i trase)", en: "Garden lighting (points & cable runs)", ru: "Освещение двора (точки и кабельные трассы)" },
          fields: [
            {
              key: "broj_tacaka",
              kind: "number",
              label: { sr: "Broj svetlosnih tačaka", en: "Number of light points", ru: "Количество световых точек" },
              importance: "required",
              unit: "kom",
              predefined: [4, 6, 8, 10, 15, 20],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "chips",
              label: { sr: "Tip rasvete", en: "Lighting type", ru: "Тип освещения" },
              importance: "optional",
              options: [
                { value: "stubne_lampe", label: { sr: "Stubne lampe (uz staze)", en: "Post lights (path lighting)", ru: "Столбовые фонари (вдоль дорожек)" } },
                { value: "zidne_lampe", label: { sr: "Zidne lampe (fasada kuće)", en: "Wall lights (house facade)", ru: "Настенные светильники (фасад дома)" } },
                { value: "akcentna_biljke", label: { sr: "Akcentna rasveta (biljke, arhitektura)", en: "Accent lights (plants, architecture)", ru: "Акцентное освещение (растения, архитектура)" } },
                { value: "povrsinska_ugradna", label: { sr: "Površinska ugradna (stepenice, staze)", en: "Recessed in-ground (steps, paths)", ru: "Встраиваемые в поверхность (ступени, дорожки)" } },
                { value: "rasveta_terase", label: { sr: "Rasveta terase / pergole", en: "Terrace / pergola lights", ru: "Освещение террасы / pergola" } },
              ],
            },
            {
              key: "ukopana_instalacija",
              kind: "toggle",
              label: { sr: "Ukopana instalacija (kablovi u zemlji)", en: "Underground cabling", ru: "Подземная прокладка кабелей" },
              importance: "required",
            },
            {
              key: "solar_rasveta",
              kind: "toggle",
              label: { sr: "Solarna rasveta (bez ukopavanja)", en: "Solar lights (no cabling needed)", ru: "Солнечное освещение (без прокладки кабелей)" },
              importance: "optional",
            },
            {
              key: "pametna_rasveta",
              kind: "toggle",
              label: { sr: "Pametna rasveta (senzori, timer, app)", en: "Smart lighting (sensors, timer, app)", ru: "Умное освещение (датчики, таймер, приложение)" },
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
      label: { sr: "Dvorišni objekat", en: "Outbuilding", ru: "Хозяйственная постройка" },
      icon: "home",
      subcategories: [
        {
          id: "garaza",
          label: { sr: "Garaža", en: "Garage", ru: "Гараж" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip garaže", en: "Garage type", ru: "Тип гаража" },
              importance: "required",
              options: [
                { value: "montazna_celicna", label: { sr: "Montažna čelična (brza gradnja)", en: "Prefab steel (quick build)", ru: "Сборный стальной (быстрая постройка)" } },
                { value: "zidana", label: { sr: "Zidana (blok/opeka)", en: "Masonry (block/brick)", ru: "Кладочный (блок/кирпич)" } },
                { value: "drvena_montazna", label: { sr: "Drvena montažna (skandinavski tip)", en: "Timber prefab (Scandinavian style)", ru: "Деревянный сборный (скандинавский стиль)" } },
              ],
            },
            {
              key: "broj_mesta",
              kind: "select",
              label: { sr: "Kapacitet", en: "Capacity", ru: "Вместимость" },
              importance: "required",
              options: [
                { value: "jedno", label: { sr: "Jedno vozilo", en: "Single car", ru: "Одно авто" } },
                { value: "dva", label: { sr: "Dva vozila", en: "Double car", ru: "Два авто" } },
              ],
            },
            {
              key: "garazna_vrata",
              kind: "select",
              label: { sr: "Tip garažnih vrata", en: "Garage door type", ru: "Тип гаражных ворот" },
              importance: "required",
              options: [
                { value: "sekcijska_auto", label: { sr: "Sekcijska automatska", en: "Sectional automatic", ru: "Секционные автоматические" } },
                { value: "krilna", label: { sr: "Krilna", en: "Side-hung", ru: "Распашные" } },
                { value: "klizna", label: { sr: "Klizna", en: "Sliding", ru: "Раздвижные" } },
              ],
            },
            {
              key: "struja_u_garazi",
              kind: "toggle",
              label: { sr: "Električna instalacija u garaži", en: "Electrical installation in garage", ru: "Электропроводка в гараже" },
              importance: "optional",
            },
          ],
        },
        {
          id: "letnja_kuhinja",
          label: { sr: "Letnja kuhinja / trem", en: "Summer kitchen / covered patio", ru: "Летняя кухня / навес" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina letnje kuhinje", en: "Summer kitchen area", ru: "Площадь летней кухни" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30, 40],
              unknownAllowed: true,
            },
            {
              key: "tip_konstrukcije",
              kind: "select",
              label: { sr: "Tip konstrukcije", en: "Structure type", ru: "Тип конструкции" },
              importance: "required",
              options: [
                { value: "zidana", label: { sr: "Zidana (blok/opeka)", en: "Masonry (block/brick)", ru: "Кладочная (блок/кирпич)" } },
                { value: "drvena", label: { sr: "Drvena (pergola + zidovi)", en: "Timber (pergola + walls)", ru: "Деревянная (pergola + стены)" } },
                { value: "celicna_montazna", label: { sr: "Čelična montažna konstrukcija", en: "Steel prefab structure", ru: "Стальная сборная конструкция" } },
              ],
            },
            {
              key: "instalacije",
              kind: "chips",
              label: { sr: "Instalacije u letnjoj kuhinji", en: "Services for summer kitchen", ru: "Коммуникации в летней кухне" },
              importance: "optional",
              options: [
                { value: "struja", label: { sr: "Električna instalacija", en: "Electrical", ru: "Электропроводка" } },
                { value: "voda", label: { sr: "Vodovod (lavabo, čutura)", en: "Water (sink, tap)", ru: "Водопровод (умывальник, кран)" } },
                { value: "gas_rostar", label: { sr: "Priključak za gas (roštilj)", en: "Gas point (BBQ)", ru: "Газовый вывод (мангал/барбекю)" } },
              ],
            },
          ],
        },
        {
          id: "ostava_radionica",
          label: { sr: "Ostava / radionica", en: "Garden shed / workshop", ru: "Сарай / мастерская" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area", ru: "Площадь" },
              importance: "required",
              unit: "m²",
              predefined: [4, 6, 8, 10, 12, 15],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal", en: "Material", ru: "Материал" },
              importance: "required",
              options: [
                { value: "drvena_montazna", label: { sr: "Drvena montažna ostava", en: "Timber prefab shed", ru: "Деревянный сборный сарай" } },
                { value: "zidana_blok", label: { sr: "Zidana (blok)", en: "Masonry (block)", ru: "Кладочный (блок)" } },
                { value: "celicna_premontovana", label: { sr: "Čelična premontovana", en: "Steel prefab", ru: "Стальной сборный" } },
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
      label: { sr: "Pergola i dvorišni mobilijar", en: "Pergola & garden furniture", ru: "Pergola и садовая мебель" },
      icon: "umbrella",
      subcategories: [
        {
          id: "pergola",
          label: { sr: "Pergola / nadstrešnica", en: "Pergola / shade structure", ru: "Pergola / теневая конструкция" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina pergole", en: "Pergola area", ru: "Площадь pergola" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30],
              unknownAllowed: true,
            },
            {
              key: "materijal",
              kind: "select",
              label: { sr: "Materijal pergole", en: "Pergola material", ru: "Материал pergola" },
              importance: "required",
              options: [
                { value: "drvo", label: { sr: "Drvo (bor, hrast, thermowood)", en: "Timber (pine, oak, thermowood)", ru: "Дерево (сосна, дуб, термодерево)" } },
                { value: "aluminijum", label: { sr: "Aluminijum (nisko održavanje)", en: "Aluminium (low maintenance)", ru: "Алюминий (низкое обслуживание)" } },
                { value: "celicna", label: { sr: "Čelična lamelna pergola", en: "Steel louvred pergola", ru: "Стальная ламельная pergola" } },
              ],
            },
            {
              key: "tip_krovine",
              kind: "select",
              label: { sr: "Krovni sistem pergole", en: "Pergola roof type", ru: "Кровельная система pergola" },
              importance: "optional",
              options: [
                { value: "otvorena_resatkasta", label: { sr: "Otvorena rešetkasta (sjena, ne štiti od kiše)", en: "Open lattice (shade only, not waterproof)", ru: "Открытая решётчатая (тень, не защищает от дождя)" } },
                { value: "polikarbonat", label: { sr: "Polikarbonat (prozirno, štiti od kiše)", en: "Polycarbonate (clear, waterproof)", ru: "Поликарбонат (прозрачный, защита от дождя)" } },
                { value: "bioklimatska_lamele", label: { sr: "Bioklimatske lamele (podešavajuće)", en: "Bioclimatic louvres (adjustable)", ru: "Биоклиматические ламели (регулируемые)" } },
                { value: "canvas_nadstresnica", label: { sr: "Canvas platno / tenda", en: "Canvas / awning", ru: "Брезент / тент-маркиза" } },
              ],
            },
            {
              key: "rasveta_pergola",
              kind: "toggle",
              label: { sr: "Ugradnja rasvete u pergoли", en: "Integrated pergola lighting", ru: "Интегрированное освещение pergola" },
              importance: "optional",
            },
          ],
        },
        {
          id: "bazen",
          label: { sr: "Bazen", en: "Swimming pool", ru: "Бассейн" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip bazena", en: "Pool type", ru: "Тип бассейна" },
              importance: "required",
              options: [
                { value: "ab_zidan", label: { sr: "AB / zidani (trajni)", en: "Concrete / masonry (permanent)", ru: "ЖБ / кладочный (капитальный)" } },
                { value: "prefabrikovani_liner", label: { sr: "Prefabrikovani sa liner folijom", en: "Prefab with liner", ru: "Сборный с лайнером" } },
                { value: "container_pool", label: { sr: "Kontejner bazen (modularni)", en: "Container pool (modular)", ru: "Контейнерный бассейн (модульный)" } },
                { value: "nadzemni", label: { sr: "Nadzemni bazen (privremeni)", en: "Above-ground pool (temporary)", ru: "Надземный бассейн (временный)" } },
              ],
            },
            {
              key: "dimenzije",
              kind: "text",
              label: { sr: "Dimenzije bazena (dužina × širina × dubina)", en: "Pool dimensions (L × W × depth)", ru: "Размеры бассейна (длина × ширина × глубина)" },
              importance: "required",
              placeholder: { sr: "npr. 8×4×1.5 m", en: "e.g. 8×4×1.5 m", ru: "напр. 8×4×1.5 м" },
            },
            {
              key: "oprema",
              kind: "chips",
              label: { sr: "Oprema bazena", en: "Pool equipment", ru: "Оборудование бассейна" },
              importance: "optional",
              options: [
                { value: "filtracija", label: { sr: "Filtracija (pumpa + peščani filter)", en: "Filtration (pump + sand filter)", ru: "Фильтрация (насос + песчаный фильтр)" } },
                { value: "solarno_grejanje", label: { sr: "Solarno grejanje vode", en: "Solar water heating", ru: "Солнечный подогрев воды" } },
                { value: "toplotna_pumpa_bazen", label: { sr: "Toplotna pumpa za bazen", en: "Heat pump for pool", ru: "Тепловой насос для бассейна" } },
                { value: "automatska_hemija", label: { sr: "Automatska dozirna stanica (hemija)", en: "Automatic chemical dosing", ru: "Автоматическая дозирующая станция (химия)" } },
                { value: "automatski_pokrivac", label: { sr: "Automatski pokrivač bazena", en: "Automatic pool cover", ru: "Автоматическое покрытие бассейна" } },
                { value: "led_rasveta_bazen", label: { sr: "LED rasveta bazena", en: "Pool LED lighting", ru: "LED освещение бассейна" } },
              ],
            },
          ],
        },
      ],
    },

  ],
};
