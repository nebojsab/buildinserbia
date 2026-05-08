import type { WizardProjectTree } from "./types";

export const renovacijaTree: WizardProjectTree = {
  projectType: "reno",
  label: { sr: "Renovacija", en: "Renovation", ru: "Ремонт" },
  categories: [

    // ─────────────────────────────────────────────────────────
    // 1. KUPATILO
    // ─────────────────────────────────────────────────────────
    {
      id: "kupatilo",
      label: { sr: "Kupatilo", en: "Bathroom", ru: "Ванная комната" },
      icon: "bath",
      subcategories: [
        {
          id: "kupatilo_kompletno",
          exclusive: true,
          label: { sr: "Kompletna rekonstrukcija kupatila", en: "Full bathroom renovation", ru: "Полный ремонт ванной комнаты" },
          description: {
            sr: "Demontaža svega, nova keramika, sanitarije, instalacije",
            en: "Full strip-out, new tiles, sanitary ware, plumbing",
            ru: "Полный демонтаж, новая плитка, сантехника, трубопровод",
          },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina kupatila", en: "Bathroom area", ru: "Площадь ванной комнаты" },
              importance: "required",
              unit: "m²",
              predefined: [3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "visina",
              kind: "number",
              label: { sr: "Visina prostorije", en: "Room height", ru: "Высота помещения" },
              importance: "optional",
              unit: "m",
              predefined: [2.4, 2.6, 2.8, 3.0],
              unknownAllowed: true,
            },
            {
              key: "zamena_instalacija",
              kind: "toggle",
              label: { sr: "Zamena vodovodnih instalacija", en: "Replace plumbing pipes", ru: "Замена водопроводных труб" },
              importance: "required",
            },
            {
              key: "zamena_elektrike",
              kind: "toggle",
              label: { sr: "Zamena električne instalacije", en: "Replace electrical wiring", ru: "Замена электропроводки" },
              importance: "required",
            },
            {
              key: "sanitarije",
              kind: "chips",
              label: { sr: "Nova sanitarija", en: "New sanitary ware", ru: "Новая сантехника" },
              importance: "required",
              options: [
                { value: "wc", label: { sr: "WC šolja", en: "Toilet", ru: "Унитаз" } },
                { value: "lavabo", label: { sr: "Lavabo", en: "Sink", ru: "Умывальник" } },
                { value: "kada", label: { sr: "Kada", en: "Bathtub", ru: "Ванна" } },
                { value: "tus_kabina", label: { sr: "Tuš kabina", en: "Shower cabin", ru: "Душевая кабина" } },
                { value: "tusna_pregrada", label: { sr: "Tušna pregrada (staklena)", en: "Shower screen", ru: "Душевая перегородка (стеклянная)" } },
                { value: "umivaonik_ormaric", label: { sr: "Ormarić ispod lavaba", en: "Vanity cabinet", ru: "Тумба под раковину" } },
              ],
            },
            {
              key: "podno_grejanje",
              kind: "toggle",
              label: { sr: "Podno grejanje u kupatilu", en: "Underfloor heating", ru: "Тёплый пол в ванной" },
              importance: "optional",
            },
            {
              key: "ventilacija",
              kind: "toggle",
              label: { sr: "Mehanička ventilacija (aspirator)", en: "Mechanical ventilation (fan)", ru: "Механическая вентиляция (вытяжной вентилятор)" },
              importance: "optional",
            },
            {
              key: "napomena",
              kind: "text",
              label: { sr: "Napomena / posebni zahtevi", en: "Notes / special requirements", ru: "Примечание / особые требования" },
              importance: "niceToHave",
              placeholder: { sr: "npr. ugradnja jacuzzija, poseban raspored pločica...", en: "e.g. jacuzzi, custom tile layout...", ru: "напр. установка джакузи, особая раскладка плитки..." },
            },
          ],
          estimateNotes: {
            sr: "Cena uključuje keramičarske radove, hidro-izolaciju, sanitarije i instalacije. Oprema (sanitarije, armature) nije uračunata u radove.",
            en: "Price includes tiling, waterproofing, sanitary work and plumbing. Fixtures and fittings are not included in labour estimate.",
            ru: "Цена включает плиточные работы, гидроизоляцию, сантехнику и трубопровод. Оборудование (сантехника, арматура) не входит в стоимость работ.",
          },
        },
        {
          id: "kupatilo_keramika_dem",
          label: { sr: "Zamena keramike – sa demontažom", en: "Retiling – with strip-out", ru: "Замена плитки – с демонтажем" },
          description: {
            sr: "Skidanje stare keramike, hidroizolacija, postavljanje novih pločica",
            en: "Remove old tiles, waterproofing, lay new tiles",
            ru: "Снятие старой плитки, гидроизоляция, укладка новой плитки",
          },
          fields: [
            {
              key: "povrsina_poda",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area", ru: "Площадь пола" },
              importance: "required",
              unit: "m²",
              predefined: [3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "povrsina_zidova",
              kind: "area",
              label: { sr: "Površina zidova za keramiku", en: "Wall tile area", ru: "Площадь стен под плитку" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30],
              unknownAllowed: true,
            },
            {
              key: "tip_keramike",
              kind: "select",
              label: { sr: "Tip pločica", en: "Tile type", ru: "Тип плитки" },
              importance: "optional",
              options: [
                { value: "standard", label: { sr: "Standard (do 30x60)", en: "Standard (up to 30x60)", ru: "Стандарт (до 30x60)" } },
                { value: "large_format", label: { sr: "Veliki format (60x60+)", en: "Large format (60x60+)", ru: "Крупный формат (60x60+)" } },
                { value: "mozaik", label: { sr: "Mozaik", en: "Mosaic", ru: "Мозаика" } },
                { value: "kamen", label: { sr: "Prirodni kamen", en: "Natural stone", ru: "Натуральный камень" } },
              ],
            },
            {
              key: "hidroizolacija",
              kind: "toggle",
              label: { sr: "Ugradnja hidroizolacije pre keramike", en: "Waterproofing before tiling", ru: "Гидроизоляция перед укладкой плитки" },
              importance: "required",
            },
          ],
        },
        {
          id: "kupatilo_keramika_bez",
          label: { sr: "Zamena keramike – bez demontaže", en: "Retiling – over existing tiles", ru: "Замена плитки – без демонтажа" },
          description: {
            sr: "Postavljanje novih pločica preko postojeće podloge (stara keramika ostaje)",
            en: "Lay new tiles over existing surface (old tiles stay)",
            ru: "Укладка новой плитки поверх существующей (старая плитка остаётся)",
          },
          fields: [
            {
              key: "povrsina_poda",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area", ru: "Площадь пола" },
              importance: "required",
              unit: "m²",
              predefined: [3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "povrsina_zidova",
              kind: "area",
              label: { sr: "Površina zidova za keramiku", en: "Wall tile area", ru: "Площадь стен под плитку" },
              importance: "required",
              unit: "m²",
              predefined: [10, 15, 20, 25, 30],
              unknownAllowed: true,
            },
            {
              key: "tip_keramike",
              kind: "select",
              label: { sr: "Tip pločica", en: "Tile type", ru: "Тип плитки" },
              importance: "optional",
              options: [
                { value: "standard", label: { sr: "Standard (do 30x60)", en: "Standard (up to 30x60)", ru: "Стандарт (до 30x60)" } },
                { value: "large_format", label: { sr: "Veliki format (60x60+)", en: "Large format (60x60+)", ru: "Крупный формат (60x60+)" } },
                { value: "mozaik", label: { sr: "Mozaik", en: "Mosaic", ru: "Мозаика" } },
                { value: "kamen", label: { sr: "Prirodni kamen", en: "Natural stone", ru: "Натуральный камень" } },
              ],
            },
          ],
        },
        {
          id: "kupatilo_sanitarije_dem",
          label: { sr: "Zamena sanitarija – sa demontažom", en: "Sanitary ware – with removal", ru: "Замена сантехники – с демонтажем" },
          description: {
            sr: "Demontaža i odvoz stare sanitarije, ugradnja nove",
            en: "Remove and dispose of old fixtures, install new",
            ru: "Демонтаж и вывоз старой сантехники, установка новой",
          },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se menja", en: "Items to replace", ru: "Что меняется" },
              importance: "required",
              options: [
                { value: "wc", label: { sr: "WC šolja + vodokotlić", en: "Toilet + cistern", ru: "Унитаз + бачок" } },
                { value: "lavabo", label: { sr: "Lavabo + baterija", en: "Sink + tap", ru: "Умывальник + смеситель" } },
                { value: "kada", label: { sr: "Kada + baterija", en: "Bathtub + tap", ru: "Ванна + смеситель" } },
                { value: "tus_kabina", label: { sr: "Tuš kabina", en: "Shower cabin", ru: "Душевая кабина" } },
                { value: "bojler", label: { sr: "Bojler", en: "Water heater", ru: "Водонагреватель" } },
              ],
            },
            {
              key: "ugradnja_bojlera_litara",
              kind: "select",
              label: { sr: "Zapremina bojlera", en: "Water heater capacity", ru: "Объём водонагревателя" },
              importance: "optional",
              options: [
                { value: "50", label: { sr: "50L", en: "50L", ru: "50L" } },
                { value: "80", label: { sr: "80L", en: "80L", ru: "80L" } },
                { value: "100", label: { sr: "100L", en: "100L", ru: "100L" } },
                { value: "150", label: { sr: "150L", en: "150L", ru: "150L" } },
              ],
              showWhen: { bojler: true },
            },
          ],
        },
        {
          id: "kupatilo_sanitarije_bez",
          label: { sr: "Zamena sanitarija – bez demontaže", en: "Sanitary ware – no removal", ru: "Замена сантехники – без демонтажа" },
          description: {
            sr: "Ugradnja nove sanitarije na postojeće priključke (bez rušenja)",
            en: "Install new fixtures on existing connections (no demolition)",
            ru: "Установка новой сантехники на существующие подключения (без сноса)",
          },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se menja", en: "Items to replace", ru: "Что меняется" },
              importance: "required",
              options: [
                { value: "wc", label: { sr: "WC šolja + vodokotlić", en: "Toilet + cistern", ru: "Унитаз + бачок" } },
                { value: "lavabo", label: { sr: "Lavabo + baterija", en: "Sink + tap", ru: "Умывальник + смеситель" } },
                { value: "tus_kabina", label: { sr: "Tuš kabina", en: "Shower cabin", ru: "Душевая кабина" } },
                { value: "ogledalo_ormaric", label: { sr: "Ogledalo / ormarić", en: "Mirror / cabinet", ru: "Зеркало / шкафчик" } },
              ],
            },
          ],
        },
        {
          id: "kupatilo_instalacije",
          label: { sr: "Instalacije kupatila", en: "Bathroom plumbing & wiring", ru: "Сантехника и электрика ванной" },
          description: {
            sr: "Vodovod, odvodnja, električna instalacija — bez keramike i sanitarija",
            en: "Water supply, drainage, electrical — without tiling or fixtures",
            ru: "Водоснабжение, канализация, электрика — без плитки и сантехники",
          },
          fields: [
            {
              key: "vodovod",
              kind: "toggle",
              label: { sr: "Vodovod i odvodnja", en: "Water supply and drainage", ru: "Водоснабжение и канализация" },
              importance: "required",
            },
            {
              key: "elektrika",
              kind: "toggle",
              label: { sr: "Električna instalacija", en: "Electrical wiring", ru: "Электропроводка" },
              importance: "required",
            },
            {
              key: "podno_grejanje",
              kind: "toggle",
              label: { sr: "Podno grejanje (električno)", en: "Underfloor heating (electric)", ru: "Тёплый пол (электрический)" },
              importance: "optional",
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina kupatila", en: "Bathroom area", ru: "Площадь ванной комнаты" },
              importance: "required",
              unit: "m²",
              predefined: [3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
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
      label: { sr: "Podovi", en: "Flooring", ru: "Полы" },
      icon: "layers",
      subcategories: [
        {
          id: "podovi_po_prostorijama",
          label: { sr: "Radovi na podovima", en: "Floor works", ru: "Работы по полам" },
          description: {
            sr: "Definišite vrstu poda i površinu po svakoj prostoriji",
            en: "Define floor type and area for each room",
            ru: "Укажите тип и площадь пола для каждой комнаты",
          },
          fields: [
            {
              key: "prostorije",
              kind: "rooms",
              label: { sr: "Prostorije", en: "Rooms", ru: "Комнаты" },
              importance: "required",
              maxRooms: 10,
              roomFields: [
                {
                  key: "tip",
                  kind: "select",
                  label: { sr: "Vrsta poda", en: "Floor type", ru: "Тип пола" },
                  importance: "required",
                  options: [
                    { value: "parket", label: { sr: "Parket (masivni / troslojan)", en: "Hardwood (solid / engineered)", ru: "Паркет (массив / трёхслойный)" } },
                    { value: "laminat", label: { sr: "Laminat", en: "Laminate", ru: "Ламинат" } },
                    { value: "keramika", label: { sr: "Keramičke pločice", en: "Ceramic tiles", ru: "Керамическая плитка" } },
                    { value: "brodski", label: { sr: "Brodski pod", en: "Plank flooring", ru: "Корабельная доска" } },
                    { value: "vinil", label: { sr: "Vinil / SPC / LVT", en: "Vinyl / SPC / LVT", ru: "Винил / SPC / LVT" } },
                    { value: "epoxy", label: { sr: "Epoksidni pod", en: "Epoxy flooring", ru: "Эпоксидный пол" } },
                    { value: "mikrocement", label: { sr: "Mikrocement / poliran beton", en: "Microcement / polished concrete", ru: "Микроцемент / полированный бетон" } },
                  ],
                },
                {
                  key: "povrsina",
                  kind: "area",
                  label: { sr: "Površina", en: "Area", ru: "Площадь" },
                  importance: "required",
                  unit: "m²",
                  predefined: [8, 12, 16, 20, 25, 30, 40],
                  unknownAllowed: true,
                },
                {
                  key: "demontaza",
                  kind: "toggle",
                  label: { sr: "Demontaža starog poda", en: "Remove existing floor", ru: "Демонтаж старого пола" },
                  importance: "required",
                },
                {
                  key: "lajsne",
                  kind: "toggle",
                  label: { sr: "Ugradnja lajsni", en: "Install skirting boards", ru: "Установка плинтусов" },
                  importance: "optional",
                },
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
      label: { sr: "Zidovi i plafoni", en: "Walls & Ceilings", ru: "Стены и потолки" },
      icon: "square",
      subcategories: [
        {
          id: "zidovi_krecenje",
          label: { sr: "Krečenje i bojenje", en: "Plastering & painting", ru: "Штукатурка и покраска" },
          fields: [
            {
              key: "povrsina_zidova",
              kind: "area",
              label: { sr: "Površina zidova", en: "Wall area", ru: "Площадь стен" },
              importance: "required",
              unit: "m²",
              predefined: [30, 50, 80, 100, 150, 200],
              unknownAllowed: true,
              help: {
                sr: "Ukupna površina svih zidova koje treba ličiti. Stan od 50m² ima ~180m² zidova.",
                en: "Total wall area to paint. A 50m² flat has ~180m² of walls.",
                ru: "Общая площадь всех стен, которые нужно покрасить. Квартира 50m² имеет ~180m² стен.",
              },
            },
            {
              key: "povrsina_plafona",
              kind: "area",
              label: { sr: "Površina plafona", en: "Ceiling area", ru: "Площадь потолка" },
              importance: "optional",
              unit: "m²",
              predefined: [20, 30, 40, 50, 60, 80],
              unknownAllowed: true,
            },
            {
              key: "broj_slojeva",
              kind: "select",
              label: { sr: "Priprema površine", en: "Surface preparation", ru: "Подготовка поверхности" },
              importance: "required",
              options: [
                { value: "samo_boja", label: { sr: "Samo bojenje (površina u dobrom stanju)", en: "Paint only (surface in good condition)", ru: "Только покраска (поверхность в хорошем состоянии)" } },
                { value: "gletovanje", label: { sr: "Gletovanje + bojenje", en: "Skim coat + paint", ru: "Шпаклёвка + покраска" } },
                { value: "kompletna_priprema", label: { sr: "Kompletna priprema (skidanje starog, špajzanje, gletovanje)", en: "Full prep (strip, fill, skim)", ru: "Полная подготовка (снятие старого, заделка, шпаклёвка)" } },
              ],
            },
            {
              key: "boja_tip",
              kind: "select",
              label: { sr: "Tip boje", en: "Paint type", ru: "Тип краски" },
              importance: "optional",
              options: [
                { value: "disperziona", label: { sr: "Disperziona (standard)", en: "Emulsion (standard)", ru: "Дисперсионная (стандарт)" } },
                { value: "silikatna", label: { sr: "Silikatna (premium, otpornija)", en: "Silicate (premium)", ru: "Силикатная (премиум, более стойкая)" } },
                { value: "dekorativna", label: { sr: "Dekorativna efektna boja", en: "Decorative effect paint", ru: "Декоративная эффектная краска" } },
              ],
            },
          ],
        },
        {
          id: "zidovi_gipskarton",
          label: { sr: "Gips-karton (suvomontaža)", en: "Drylining / plasterboard", ru: "Гипсокартон (сухой монтаж)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area", ru: "Площадь" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "chips",
              label: { sr: "Vrsta radova", en: "Type of work", ru: "Вид работ" },
              importance: "required",
              options: [
                { value: "spusteni_plafon", label: { sr: "Spušteni plafon", en: "Suspended ceiling", ru: "Подвесной потолок" } },
                { value: "pregradni_zid", label: { sr: "Pregradni zid", en: "Partition wall", ru: "Перегородка" } },
                { value: "obloga_zida", label: { sr: "Obloga zida / niša", en: "Wall cladding / niche", ru: "Обшивка стены / ниша" } },
                { value: "stepenicasti_plafon", label: { sr: "Stepenasti / ukrasni plafon", en: "Feature / stepped ceiling", ru: "Многоуровневый / декоративный потолок" } },
              ],
            },
            {
              key: "zvucna_izolacija",
              kind: "toggle",
              label: { sr: "Ugradnja zvučne izolacije", en: "Install acoustic insulation", ru: "Монтаж звукоизоляции" },
              importance: "optional",
            },
            {
              key: "toplotna_izolacija",
              kind: "toggle",
              label: { sr: "Ugradnja toplotne izolacije", en: "Install thermal insulation", ru: "Монтаж теплоизоляции" },
              importance: "optional",
            },
          ],
        },
        {
          id: "zidovi_dekorativni_malter",
          label: { sr: "Dekorativni malter / štukatura", en: "Decorative render / stucco", ru: "Декоративная штукатурка / стукко" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area", ru: "Площадь" },
              importance: "required",
              unit: "m²",
              predefined: [5, 10, 20, 30, 50],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip dekorativnog maltera", en: "Render type", ru: "Тип декоративной штукатурки" },
              importance: "optional",
              options: [
                { value: "venecijaner", label: { sr: "Venecijaner", en: "Venetian plaster", ru: "Венецианская штукатурка" } },
                { value: "marmorino", label: { sr: "Marmorino", en: "Marmorino", ru: "Мармарино" } },
                { value: "rustika", label: { sr: "Rustika / ribana fasadna", en: "Rustic render", ru: "Рустика / тёртая штукатурка" } },
                { value: "mikrocement_zid", label: { sr: "Mikrocement na zidu", en: "Wall microcement", ru: "Микроцемент на стене" } },
              ],
            },
          ],
        },
        {
          id: "zidovi_tapete",
          label: { sr: "Tapetiranje", en: "Wallpapering", ru: "Оклейка обоями" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area", ru: "Площадь" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80],
              unknownAllowed: true,
            },
            {
              key: "tip_tapete",
              kind: "select",
              label: { sr: "Tip tapete", en: "Wallpaper type", ru: "Тип обоев" },
              importance: "optional",
              options: [
                { value: "papirna", label: { sr: "Papirna", en: "Paper", ru: "Бумажные" } },
                { value: "vinilna", label: { sr: "Vinilna (periva)", en: "Vinyl (washable)", ru: "Виниловые (моющиеся)" } },
                { value: "flizelinska", label: { sr: "Flizelinska (non-woven)", en: "Non-woven", ru: "Флизелиновые (нетканые)" } },
                { value: "stakloplasticna", label: { sr: "Stakloplastična (strukturna)", en: "Fibreglass (textured)", ru: "Стекловолоконные (структурные)" } },
              ],
            },
            {
              key: "skidanje_starih",
              kind: "toggle",
              label: { sr: "Skidanje starih tapeta", en: "Remove existing wallpaper", ru: "Снятие старых обоев" },
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
      label: { sr: "Prozori i vrata", en: "Windows & Doors", ru: "Окна и двери" },
      icon: "door-open",
      subcategories: [
        {
          id: "prozori_zamena",
          label: { sr: "Zamena prozora", en: "Window replacement", ru: "Замена окон" },
          fields: [
            {
              key: "broj_prozora",
              kind: "number",
              label: { sr: "Broj prozora", en: "Number of windows", ru: "Количество окон" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6, 8, 10],
              unknownAllowed: true,
            },
            {
              key: "ukupna_povrsina",
              kind: "area",
              label: { sr: "Ukupna površina prozora (opciono)", en: "Total window area (optional)", ru: "Общая площадь окон (необязательно)" },
              importance: "optional",
              unit: "m²",
              unknownAllowed: true,
              help: {
                sr: "Ako znate ukupnu m² prozora, preciznije računamo cenu.",
                en: "Providing total m² gives a more precise estimate.",
                ru: "Указание общей площади m² даёт более точную оценку стоимости.",
              },
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
                { value: "drvo_aluminijum", label: { sr: "Drvo-aluminijum (Euro)", en: "Wood-aluminium (Euro)", ru: "Дерево-алюминий (Евро)" } },
              ],
            },
            {
              key: "staklo",
              kind: "select",
              label: { sr: "Tip ostakljenja", en: "Glazing type", ru: "Тип остекления" },
              importance: "optional",
              options: [
                { value: "dvostuko", label: { sr: "Dvoslojno (4-16-4)", en: "Double glazed (4-16-4)", ru: "Двойное (4-16-4)" } },
                { value: "trojstuko", label: { sr: "Troslojno (premium)", en: "Triple glazed (premium)", ru: "Тройное (премиум)" } },
              ],
            },
            {
              key: "roletne",
              kind: "toggle",
              label: { sr: "Ugradnja roletni", en: "Install roller shutters", ru: "Установка рольставней" },
              importance: "optional",
            },
            {
              key: "komarnici",
              kind: "toggle",
              label: { sr: "Komarnici", en: "Fly screens", ru: "Москитные сетки" },
              importance: "optional",
            },
            {
              key: "demontaza_starih",
              kind: "toggle",
              label: { sr: "Demontaža i odvoz starih prozora", en: "Remove and dispose of old windows", ru: "Демонтаж и вывоз старых окон" },
              importance: "required",
            },
          ],
          estimateNotes: {
            sr: "Cena je bez cene stolarije — samo ugradnja i obzide. Cena stolarije zavisi od dobavljača.",
            en: "Labour only — window units priced separately by supplier.",
            ru: "Только монтажные работы — стоимость оконных блоков рассчитывается отдельно поставщиком.",
          },
        },
        {
          id: "vrata_unutrasnja",
          label: { sr: "Unutrašnja vrata", en: "Interior doors", ru: "Межкомнатные двери" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj vrata", en: "Number of doors", ru: "Количество дверей" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4, 5, 6, 8],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip vrata", en: "Door type", ru: "Тип двери" },
              importance: "optional",
              options: [
                { value: "klasicna", label: { sr: "Klasična (krilna)", en: "Swing door", ru: "Классическая (распашная)" } },
                { value: "klizna", label: { sr: "Klizna (džepna)", en: "Sliding / pocket door", ru: "Раздвижная / карманная" } },
                { value: "plocastokrilna", label: { sr: "Plosnata (flush)", en: "Flush door", ru: "Плоская (флэш)" } },
              ],
            },
            {
              key: "ugradnja_stelaze",
              kind: "toggle",
              label: { sr: "Montaža štelaze (podešavanje krilnog okvira)", en: "Adjust/install door frame", ru: "Монтаж / регулировка дверной коробки" },
              importance: "optional",
            },
            {
              key: "zidanje_otvora",
              kind: "toggle",
              label: { sr: "Izmena otvora (zidarski radovi)", en: "Modify wall opening (masonry work)", ru: "Изменение проёма (каменные работы)" },
              importance: "optional",
            },
          ],
        },
        {
          id: "vrata_ulazna",
          label: { sr: "Ulazna vrata", en: "Entrance / security door", ru: "Входная / бронированная дверь" },
          fields: [
            {
              key: "broj_vrata",
              kind: "number",
              label: { sr: "Broj vrata", en: "Number of doors", ru: "Количество дверей" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2],
              unknownAllowed: false,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip ulaznih vrata", en: "Entry door type", ru: "Тип входной двери" },
              importance: "required",
              options: [
                { value: "sigurnosna_celicna", label: { sr: "Sigurnosna čelična", en: "Steel security door", ru: "Стальная бронированная" } },
                { value: "pvc", label: { sr: "PVC ulazna", en: "PVC entry door", ru: "ПВХ входная" } },
                { value: "aluminijum", label: { sr: "Aluminijumska", en: "Aluminium entry door", ru: "Алюминиевая" } },
                { value: "drvo_masivno", label: { sr: "Masivno drvo", en: "Solid wood", ru: "Массив дерева" } },
              ],
            },
            {
              key: "montaza_interfona",
              kind: "toggle",
              label: { sr: "Ugradnja video interfona", en: "Install video intercom", ru: "Установка видеодомофона" },
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
      label: { sr: "Elektrika", en: "Electrical", ru: "Электрика" },
      icon: "zap",
      subcategories: [
        {
          id: "elektrika_kompletna",
          label: { sr: "Kompletna zamena elektroinstalacije", en: "Full electrical rewiring", ru: "Полная замена электропроводки" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina objekta", en: "Floor area", ru: "Площадь объекта" },
              importance: "required",
              unit: "m²",
              predefined: [30, 40, 50, 60, 80, 100, 120, 150],
              unknownAllowed: true,
            },
            {
              key: "broj_soba",
              kind: "number",
              label: { sr: "Broj prostorija", en: "Number of rooms", ru: "Количество комнат" },
              importance: "optional",
              unit: "kom",
              predefined: [2, 3, 4, 5, 6],
              unknownAllowed: true,
            },
            {
              key: "razvodna_tabla",
              kind: "toggle",
              label: { sr: "Nova razvodna tabla (osigurači)", en: "New consumer unit (fuse board)", ru: "Новый распределительный щит (предохранители)" },
              importance: "required",
            },
            {
              key: "broj_strujnih_krugova",
              kind: "number",
              label: { sr: "Broj strujnih krugova (okvirno)", en: "Number of circuits (approx)", ru: "Количество цепей (приблизительно)" },
              importance: "optional",
              unit: "kom",
              predefined: [6, 8, 10, 12, 16],
              unknownAllowed: true,
            },
            {
              key: "ugradnja_kable_kanala",
              kind: "toggle",
              label: { sr: "Kablovi u kanale (vidljiva montaža)", en: "Surface-mounted cable trunking", ru: "Кабели в кабель-каналы (открытая прокладка)" },
              importance: "optional",
            },
          ],
          estimateNotes: {
            sr: "Cena ne uključuje sijalice, lusteri, roletne i slična potrošačka dobra.",
            en: "Excludes light fittings, appliances and consumer goods.",
            ru: "Не включает светильники, люстры, жалюзи и аналогичные потребительские товары.",
          },
        },
        {
          id: "elektrika_delimicna",
          label: { sr: "Delimična zamena / dogradnja", en: "Partial rewiring / additions", ru: "Частичная замена / дополнение" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "utičnice_prekidači", label: { sr: "Utičnice i prekidači", en: "Sockets & switches", ru: "Розетки и выключатели" } },
                { value: "rasvetni_krug", label: { sr: "Novi rasvetni krug", en: "New lighting circuit", ru: "Новая цепь освещения" } },
                { value: "kuhinja_krug", label: { sr: "Kuhinja (poseban krug za šporet/rernu)", en: "Kitchen circuit (hob/oven)", ru: "Кухня (отдельная цепь для плиты/духовки)" } },
                { value: "kupatilo_krug", label: { sr: "Kupatilo (poseban krug)", en: "Bathroom circuit", ru: "Ванная (отдельная цепь)" } },
                { value: "spoljna_rasveta", label: { sr: "Spoljna rasveta", en: "Outdoor lighting", ru: "Наружное освещение" } },
              ],
            },
            {
              key: "broj_tackastih_radova",
              kind: "number",
              label: { sr: "Okvirni broj tačaka (utičnice + osvetljenje)", en: "Approx. number of points (sockets + lights)", ru: "Примерное количество точек (розетки + освещение)" },
              importance: "optional",
              unit: "kom",
              predefined: [5, 10, 15, 20, 30],
              unknownAllowed: true,
            },
          ],
        },
        {
          id: "elektrika_klima",
          label: { sr: "Ugradnja klima uređaja (split sistem)", en: "Air conditioning installation (split unit)", ru: "Установка кондиционера (сплит-система)" },
          fields: [
            {
              key: "broj_jedinica",
              kind: "number",
              label: { sr: "Broj unutrašnjih jedinica", en: "Number of indoor units", ru: "Количество внутренних блоков" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3, 4],
              unknownAllowed: false,
            },
            {
              key: "tip_sistema",
              kind: "select",
              label: { sr: "Tip sistema", en: "System type", ru: "Тип системы" },
              importance: "optional",
              options: [
                { value: "mono_split", label: { sr: "Mono-split (1 spoljna + 1 unutrašnja)", en: "Mono-split (1 outdoor + 1 indoor)", ru: "Моно-сплит (1 внешний + 1 внутренний)" } },
                { value: "multi_split", label: { sr: "Multi-split (1 spoljna + više unutrašnjih)", en: "Multi-split (1 outdoor + multiple indoor)", ru: "Мульти-сплит (1 внешний + несколько внутренних)" } },
              ],
            },
            {
              key: "prohodnost_fasade",
              kind: "toggle",
              label: { sr: "Bušenje fasade (spoljna instalacija)", en: "Facade penetration (outdoor unit)", ru: "Сверление фасада (наружная установка)" },
              importance: "required",
            },
          ],
        },
        {
          id: "elektrika_smarthome",
          label: { sr: "Pametna kuća (Smart home)", en: "Smart home automation", ru: "Умный дом (Smart home)" },
          fields: [
            {
              key: "obim",
              kind: "chips",
              label: { sr: "Šta se automatizuje", en: "Automation scope", ru: "Что автоматизируется" },
              importance: "required",
              options: [
                { value: "osvetljenje", label: { sr: "Pametno osvetljenje", en: "Smart lighting", ru: "Умное освещение" } },
                { value: "termostati", label: { sr: "Pametni termostati", en: "Smart thermostats", ru: "Умные термостаты" } },
                { value: "roletne_motori", label: { sr: "Motorizovane roletne", en: "Motorised blinds/shutters", ru: "Моторизованные жалюзи/рольставни" } },
                { value: "alarm", label: { sr: "Alarm i sigurnost", en: "Alarm & security", ru: "Сигнализация и безопасность" } },
                { value: "kamere", label: { sr: "Nadzorne kamere", en: "CCTV cameras", ru: "Камеры видеонаблюдения" } },
                { value: "audio_video", label: { sr: "Audio/video distribucija", en: "AV distribution", ru: "Аудио/видео распределение" } },
              ],
            },
            {
              key: "sistem",
              kind: "select",
              label: { sr: "Platforma", en: "Platform", ru: "Платформа" },
              importance: "optional",
              options: [
                { value: "knx", label: { sr: "KNX (industrijski standard)", en: "KNX (industry standard)", ru: "KNX (промышленный стандарт)" } },
                { value: "zigbee_wifi", label: { sr: "Zigbee/WiFi (Tuya, Home Assistant...)", en: "Zigbee/WiFi (Tuya, Home Assistant...)", ru: "Zigbee/WiFi (Tuya, Home Assistant...)" } },
                { value: "nije_odluceno", label: { sr: "Nije još odlučeno", en: "Not decided yet", ru: "Ещё не решено" } },
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
      label: { sr: "Vodovodne instalacije", en: "Plumbing", ru: "Сантехнические работы" },
      icon: "droplets",
      subcategories: [
        {
          id: "vodovod_kompletna_zamena",
          label: { sr: "Kompletna zamena cevi", en: "Full pipe replacement", ru: "Полная замена труб" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina objekta", en: "Floor area", ru: "Площадь объекта" },
              importance: "required",
              unit: "m²",
              predefined: [30, 40, 50, 60, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "materijal_cevi",
              kind: "select",
              label: { sr: "Materijal novih cevi", en: "New pipe material", ru: "Материал новых труб" },
              importance: "optional",
              options: [
                { value: "pex", label: { sr: "PEX (fleksibilne)", en: "PEX (flexible)", ru: "PEX (гибкие)" } },
                { value: "polipropilen", label: { sr: "Polipropilen (PP)", en: "Polypropylene (PP)", ru: "Полипропилен (PP)" } },
                { value: "bakar", label: { sr: "Bakar (premium)", en: "Copper (premium)", ru: "Медь (премиум)" } },
              ],
            },
            {
              key: "broj_kupatila",
              kind: "number",
              label: { sr: "Broj kupatila / WC-a", en: "Number of bathrooms / WCs", ru: "Количество ванных / WC" },
              importance: "required",
              unit: "kom",
              predefined: [1, 2, 3],
              unknownAllowed: false,
            },
            {
              key: "kuhinja",
              kind: "toggle",
              label: { sr: "Priključak kuhinje", en: "Kitchen connection", ru: "Подключение кухни" },
              importance: "required",
            },
            {
              key: "podni_sifon",
              kind: "toggle",
              label: { sr: "Ugradnja podnih sifona", en: "Install floor drains", ru: "Установка напольных сифонов" },
              importance: "optional",
            },
          ],
        },
        {
          id: "vodovod_delimicna",
          label: { sr: "Delimična izmena / priključci", en: "Partial changes / new connections", ru: "Частичные изменения / новые подключения" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "novi_kupatilski_prikljucak", label: { sr: "Novi kupatilski priključak", en: "New bathroom connection", ru: "Новое подключение ванной" } },
                { value: "novi_kuhinjski_prikljucak", label: { sr: "Novi kuhinjski priključak", en: "New kitchen connection", ru: "Новое подключение кухни" } },
                { value: "zamena_sifona_odvodnih", label: { sr: "Zamena sifona i odvodnih cevi", en: "Replace traps and drain pipes", ru: "Замена сифонов и сливных труб" } },
                { value: "preseljenje_wc", label: { sr: "Preseljenje WC šolje", en: "Relocate toilet", ru: "Перенос унитаза" } },
              ],
            },
          ],
        },
        {
          id: "vodovod_bojler",
          label: { sr: "Ugradnja / zamena bojlera", en: "Water heater install / replacement", ru: "Установка / замена водонагревателя" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip grejača vode", en: "Water heater type", ru: "Тип водонагревателя" },
              importance: "required",
              options: [
                { value: "el_akumulacioni", label: { sr: "Električni akumulacioni (bojler)", en: "Electric storage heater", ru: "Электрический накопительный (бойлер)" } },
                { value: "protočni_el", label: { sr: "Električni protočni", en: "Electric instant heater", ru: "Электрический проточный" } },
                { value: "gas_kombini", label: { sr: "Gasni kombinovani kotao", en: "Gas combi boiler", ru: "Газовый комбинированный котёл" } },
                { value: "toplotna_pumpa_bwt", label: { sr: "Toplotna pumpa za sanitarnu vodu", en: "Heat pump water heater", ru: "Тепловой насос для горячего водоснабжения" } },
              ],
            },
            {
              key: "zapremina",
              kind: "select",
              label: { sr: "Zapremina (za akumulacione)", en: "Capacity (storage heaters)", ru: "Объём (для накопительных)" },
              importance: "optional",
              options: [
                { value: "50", label: { sr: "50L", en: "50L", ru: "50L" } },
                { value: "80", label: { sr: "80L", en: "80L", ru: "80L" } },
                { value: "100", label: { sr: "100L", en: "100L", ru: "100L" } },
                { value: "150", label: { sr: "150L", en: "150L", ru: "150L" } },
                { value: "200", label: { sr: "200L", en: "200L", ru: "200L" } },
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
      label: { sr: "Grejanje", en: "Heating", ru: "Отопление" },
      icon: "flame",
      subcategories: [
        {
          id: "grejanje_kotao",
          label: { sr: "Ugradnja / zamena kotla", en: "Boiler install / replacement", ru: "Установка / замена котла" },
          fields: [
            {
              key: "tip_kotla",
              kind: "select",
              label: { sr: "Tip kotla", en: "Boiler type", ru: "Тип котла" },
              importance: "required",
              options: [
                { value: "gas_kondenzacioni", label: { sr: "Gasni kondenzacioni (najefikasniji)", en: "Gas condensing (most efficient)", ru: "Газовый конденсационный (наиболее эффективный)" } },
                { value: "gas_klasicni", label: { sr: "Gasni klasični", en: "Gas conventional", ru: "Газовый классический" } },
                { value: "pelet", label: { sr: "Peletni kotao", en: "Pellet boiler", ru: "Пеллетный котёл" } },
                { value: "drva", label: { sr: "Na drva / ugalj", en: "Wood / coal", ru: "На дровах / угле" } },
                { value: "el_kotao", label: { sr: "Električni kotao", en: "Electric boiler", ru: "Электрический котёл" } },
                { value: "toplotna_pumpa", label: { sr: "Toplotna pumpa (vazduh-voda)", en: "Heat pump (air-to-water)", ru: "Тепловой насос (воздух-вода)" } },
              ],
            },
            {
              key: "snaga_kw",
              kind: "number",
              label: { sr: "Snaga kotla (kW)", en: "Boiler output (kW)", ru: "Мощность котла (кВт)" },
              importance: "optional",
              unit: "kW",
              predefined: [12, 18, 24, 28, 35, 45],
              unknownAllowed: true,
            },
            {
              key: "povrsina_za_grejanje",
              kind: "area",
              label: { sr: "Površina koja se greje", en: "Heated floor area", ru: "Отапливаемая площадь" },
              importance: "required",
              unit: "m²",
              predefined: [50, 70, 100, 120, 150, 200],
              unknownAllowed: true,
            },
            {
              key: "prikljucak_gasa",
              kind: "toggle",
              label: { sr: "Postoji priključak gasa", en: "Gas connection exists", ru: "Газовое подключение имеется" },
              importance: "optional",
              showWhen: { tip_kotla: "gas_kondenzacioni" },
            },
            {
              key: "dimnjak",
              kind: "toggle",
              label: { sr: "Ugradnja dimnjaka / odvoda dimnih gasova", en: "Install flue / exhaust pipe", ru: "Установка дымохода / отвода дымовых газов" },
              importance: "optional",
            },
          ],
        },
        {
          id: "grejanje_radijatori",
          label: { sr: "Zamena / dodavanje radijatora", en: "Replace / add radiators", ru: "Замена / добавление радиаторов" },
          fields: [
            {
              key: "broj_radijatora",
              kind: "number",
              label: { sr: "Broj radijatora", en: "Number of radiators", ru: "Количество радиаторов" },
              importance: "required",
              unit: "kom",
              predefined: [2, 4, 6, 8, 10, 12],
              unknownAllowed: true,
            },
            {
              key: "tip",
              kind: "select",
              label: { sr: "Tip radijatora", en: "Radiator type", ru: "Тип радиатора" },
              importance: "optional",
              options: [
                { value: "celicni_plocasti", label: { sr: "Čelični pločasti (standard)", en: "Steel panel (standard)", ru: "Стальной панельный (стандарт)" } },
                { value: "aluminijumski", label: { sr: "Aluminijumski", en: "Aluminium", ru: "Алюминиевый" } },
                { value: "liveni", label: { sr: "Liveni (art-style)", en: "Cast iron (art-style)", ru: "Чугунный (арт-стиль)" } },
                { value: "cevni_kupatilski", label: { sr: "Cevni/kupatilski", en: "Towel rail / ladder", ru: "Трубчатый / полотенцесушитель" } },
              ],
            },
            {
              key: "zamena_ventila",
              kind: "toggle",
              label: { sr: "Ugradnja termostatskih ventila", en: "Install thermostatic valves (TRVs)", ru: "Установка термостатических клапанов" },
              importance: "optional",
            },
          ],
        },
        {
          id: "grejanje_podno",
          label: { sr: "Podno grejanje (toplovodni sistem)", en: "Underfloor heating (hydronic)", ru: "Водяной тёплый пол" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area", ru: "Площадь" },
              importance: "required",
              unit: "m²",
              predefined: [20, 30, 50, 70, 100, 150],
              unknownAllowed: true,
            },
            {
              key: "zona",
              kind: "chips",
              label: { sr: "Prostorije", en: "Rooms", ru: "Помещения" },
              importance: "optional",
              options: [
                { value: "dnevna", label: { sr: "Dnevna soba", en: "Living room", ru: "Гостиная" } },
                { value: "sobe", label: { sr: "Spavaće sobe", en: "Bedrooms", ru: "Спальни" } },
                { value: "kupatilo", label: { sr: "Kupatilo", en: "Bathroom", ru: "Ванная комната" } },
                { value: "hodnik", label: { sr: "Hodnik", en: "Hallway", ru: "Коридор" } },
                { value: "kuhinja", label: { sr: "Kuhinja", en: "Kitchen", ru: "Кухня" } },
                { value: "ceo_objekat", label: { sr: "Ceo objekat", en: "Whole property", ru: "Весь объект" } },
              ],
            },
            {
              key: "estrih",
              kind: "toggle",
              label: { sr: "Izrada estriha po montaži cevi", en: "Screed after pipe installation", ru: "Стяжка после монтажа труб" },
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
      label: { sr: "Kuhinja", en: "Kitchen", ru: "Кухня" },
      icon: "utensils",
      subcategories: [
        {
          id: "kuhinja_namestaj",
          label: { sr: "Ugradna kuhinja (nameštaj)", en: "Fitted kitchen (furniture)", ru: "Встроенная кухня (мебель)" },
          fields: [
            {
              key: "duzina_kuhinjskog_bloka",
              kind: "length",
              label: { sr: "Dužina kuhinjskog bloka", en: "Kitchen run length", ru: "Длина кухонного блока" },
              importance: "required",
              unit: "m",
              predefined: [2, 2.4, 3, 3.6, 4, 4.8],
              unknownAllowed: true,
            },
            {
              key: "konfiguracija",
              kind: "select",
              label: { sr: "Konfiguracija", en: "Layout", ru: "Конфигурация" },
              importance: "optional",
              options: [
                { value: "linearna", label: { sr: "Linearna (I-oblik)", en: "Linear (I-shape)", ru: "Линейная (I-образная)" } },
                { value: "l_oblik", label: { sr: "L-oblik", en: "L-shape", ru: "Г-образная" } },
                { value: "u_oblik", label: { sr: "U-oblik", en: "U-shape", ru: "П-образная" } },
                { value: "sa_ostrvom", label: { sr: "Sa ostrvom / polustrvom", en: "With island / peninsula", ru: "С островом / полуостровом" } },
              ],
            },
            {
              key: "materijal_frontova",
              kind: "select",
              label: { sr: "Materijal frontova", en: "Door / front material", ru: "Материал фасадов" },
              importance: "optional",
              options: [
                { value: "mdf_lakiran", label: { sr: "MDF lakirani", en: "MDF lacquered", ru: "МДФ лакированный" } },
                { value: "furnirani", label: { sr: "Furnirani (drvo)", en: "Wood veneer", ru: "Шпонированный (дерево)" } },
                { value: "akrilni", label: { sr: "Akrilni (sjajni)", en: "Acrylic (high gloss)", ru: "Акриловый (глянцевый)" } },
                { value: "laminatni", label: { sr: "Laminatni (HPL)", en: "Laminate (HPL)", ru: "Ламинированный (HPL)" } },
              ],
            },
            {
              key: "radna_ploca",
              kind: "select",
              label: { sr: "Radna ploča", en: "Worktop material", ru: "Рабочая столешница" },
              importance: "optional",
              options: [
                { value: "postforming", label: { sr: "Postforming (laminat)", en: "Postforming (laminate)", ru: "Постформинг (ламинат)" } },
                { value: "granit_mermer", label: { sr: "Granit / mermer", en: "Granite / marble", ru: "Гранит / мрамор" } },
                { value: "kompozitni_kamen", label: { sr: "Kompozitni kamen (Silestone, Compac...)", en: "Engineered stone (Silestone, Compac...)", ru: "Искусственный камень (Silestone, Compac...)" } },
                { value: "drvo_mesivno", label: { sr: "Masivno drvo", en: "Solid wood", ru: "Массив дерева" } },
              ],
            },
            {
              key: "ugradnja_uredjaja",
              kind: "chips",
              label: { sr: "Ugradnja uređaja", en: "Appliance installation", ru: "Установка техники" },
              importance: "optional",
              options: [
                { value: "sporet_recno", label: { sr: "Rerni / ugradna rerma", en: "Oven (built-in)", ru: "Духовка (встраиваемая)" } },
                { value: "ploce_za_kuvanje", label: { sr: "Ploče za kuvanje", en: "Hob", ru: "Варочная панель" } },
                { value: "aspirator", label: { sr: "Aspirator / napa", en: "Extractor hood", ru: "Вытяжка / напа" } },
                { value: "masina_sudove", label: { sr: "Mašina za sudove", en: "Dishwasher", ru: "Посудомоечная машина" } },
                { value: "masina_ves", label: { sr: "Mašina za veš", en: "Washing machine", ru: "Стиральная машина" } },
                { value: "frizider", label: { sr: "Frižider (ugradni)", en: "Fridge (integrated)", ru: "Холодильник (встраиваемый)" } },
              ],
            },
          ],
        },
        {
          id: "kuhinja_keramika",
          label: { sr: "Keramika u kuhinji", en: "Kitchen tiling", ru: "Плитка на кухне" },
          fields: [
            {
              key: "povrsina_poda",
              kind: "area",
              label: { sr: "Površina poda", en: "Floor area", ru: "Площадь пола" },
              importance: "required",
              unit: "m²",
              predefined: [5, 8, 10, 12, 15, 20],
              unknownAllowed: true,
            },
            {
              key: "kecelja",
              kind: "toggle",
              label: { sr: "Kecelja (zid iza radne ploče)", en: "Splashback tiles (behind worktop)", ru: "Фартук (стена за столешницей)" },
              importance: "optional",
            },
            {
              key: "kecelja_duzina",
              kind: "length",
              label: { sr: "Dužina kecelje", en: "Splashback length", ru: "Длина фартука" },
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
          label: { sr: "Instalacije za kuhinju (voda, struja, gas)", en: "Kitchen services (water, electrical, gas)", ru: "Коммуникации для кухни (вода, электричество, газ)" },
          fields: [
            {
              key: "stavke",
              kind: "chips",
              label: { sr: "Šta se radi", en: "Work items", ru: "Что выполняется" },
              importance: "required",
              options: [
                { value: "novi_vod_voda", label: { sr: "Novi vodovodnog priključak", en: "New water supply", ru: "Новое водоснабжение" } },
                { value: "novi_vod_kanal", label: { sr: "Novi kanalizacioni priključak", en: "New waste connection", ru: "Новое канализационное подключение" } },
                { value: "novi_strujni_krug", label: { sr: "Poseban strujni krug za kuhinju", en: "Dedicated kitchen electrical circuit", ru: "Отдельная электроцепь для кухни" } },
                { value: "gas_priključak", label: { sr: "Plinski priključak", en: "Gas supply connection", ru: "Газовое подключение" } },
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
      label: { sr: "Fasada i izolacija", en: "Facade & Insulation", ru: "Фасад и утепление" },
      icon: "home",
      subcategories: [
        {
          id: "fasada_stiropor",
          label: { sr: "Stiropor fasada (ETICS sistem)", en: "EPS external wall insulation (ETICS)", ru: "Утепление фасада пенопластом (система ETICS)" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina fasade", en: "Facade area", ru: "Площадь фасада" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 150, 200, 300],
              unknownAllowed: true,
            },
            {
              key: "debljina_stiropora",
              kind: "select",
              label: { sr: "Debljina stiropora", en: "EPS thickness", ru: "Толщина пенопласта" },
              importance: "required",
              options: [
                { value: "5cm", label: { sr: "5 cm", en: "5 cm", ru: "5 см" } },
                { value: "8cm", label: { sr: "8 cm", en: "8 cm", ru: "8 см" } },
                { value: "10cm", label: { sr: "10 cm (preporučeno)", en: "10 cm (recommended)", ru: "10 см (рекомендуется)" } },
                { value: "15cm", label: { sr: "15 cm (pasivni standard)", en: "15 cm (passive standard)", ru: "15 см (пассивный стандарт)" } },
                { value: "20cm", label: { sr: "20 cm", en: "20 cm", ru: "20 см" } },
              ],
            },
            {
              key: "skele",
              kind: "toggle",
              label: { sr: "Potrebno postavljanje skela", en: "Scaffolding required", ru: "Требуются леса" },
              importance: "required",
            },
            {
              key: "demontaza_stare_fasade",
              kind: "toggle",
              label: { sr: "Demontaža stare fasade", en: "Remove existing facade", ru: "Демонтаж старого фасада" },
              importance: "optional",
            },
            {
              key: "tip_zavrsnog_maltera",
              kind: "select",
              label: { sr: "Završni sloj", en: "Finish coat", ru: "Финишный слой" },
              importance: "optional",
              options: [
                { value: "silikatni", label: { sr: "Silikatni malter (otporan, premium)", en: "Silicate render (durable, premium)", ru: "Силикатная штукатурка (прочная, премиум)" } },
                { value: "silikonski", label: { sr: "Silikonski malter", en: "Silicone render", ru: "Силиконовая штукатурка" } },
                { value: "akrilni", label: { sr: "Akrilni malter (standard)", en: "Acrylic render (standard)", ru: "Акриловая штукатурка (стандарт)" } },
                { value: "kamen_obloga", label: { sr: "Kamena obloga (delom)", en: "Stone cladding (partial)", ru: "Каменная облицовка (частичная)" } },
              ],
            },
          ],
          estimateNotes: {
            sr: "Cena uključuje sve radove i materijal ETICS sistema. Nije uključena cena skela ako su potrebne — to se posebno ceni.",
            en: "Price includes all ETICS materials and labour. Scaffolding estimated separately if required.",
            ru: "Цена включает все материалы и работы по системе ETICS. Стоимость лесов, если требуются, рассчитывается отдельно.",
          },
        },
        {
          id: "fasada_kamena_vuna",
          label: { sr: "Kamena/staklena vuna (fasada ili unutrašnjost)", en: "Rock/glass wool insulation (facade or interior)", ru: "Каменная/стеклянная вата (фасад или внутри)" },
          fields: [
            {
              key: "primena",
              kind: "select",
              label: { sr: "Primena", en: "Application", ru: "Применение" },
              importance: "required",
              options: [
                { value: "fasada_ventilisana", label: { sr: "Ventilisana fasada (oblaganje)", en: "Ventilated facade (cladding)", ru: "Вентилируемый фасад (облицовка)" } },
                { value: "unutrasnji_zid", label: { sr: "Unutrašnji zid (sa gips-kartonom)", en: "Internal wall (with plasterboard)", ru: "Внутренняя стена (с гипсокартоном)" } },
                { value: "medjuspratna_ploca", label: { sr: "Međuspratna ploča (pod/plafon)", en: "Intermediate slab (floor/ceiling)", ru: "Межэтажная плита (пол/потолок)" } },
                { value: "krov_kosina", label: { sr: "Krov (kosa streha)", en: "Pitched roof", ru: "Кровля (скатная)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina", en: "Area", ru: "Площадь" },
              importance: "required",
              unit: "m²",
              predefined: [20, 40, 60, 80, 100, 150],
              unknownAllowed: true,
            },
            {
              key: "debljina",
              kind: "select",
              label: { sr: "Debljina vune", en: "Wool thickness", ru: "Толщина ваты" },
              importance: "optional",
              options: [
                { value: "5cm", label: { sr: "5 cm", en: "5 cm", ru: "5 см" } },
                { value: "8cm", label: { sr: "8 cm", en: "8 cm", ru: "8 см" } },
                { value: "10cm", label: { sr: "10 cm", en: "10 cm", ru: "10 см" } },
                { value: "15cm", label: { sr: "15 cm", en: "15 cm", ru: "15 см" } },
              ],
            },
          ],
        },
        {
          id: "fasada_hidroizolacija",
          label: { sr: "Hidroizolacija (podrum, ravni krov, terasa)", en: "Waterproofing (basement, flat roof, terrace)", ru: "Гидроизоляция (подвал, плоская кровля, терраса)" },
          fields: [
            {
              key: "tip_lokacije",
              kind: "chips",
              label: { sr: "Lokacija hidroizolacije", en: "Waterproofing location", ru: "Место гидроизоляции" },
              importance: "required",
              options: [
                { value: "podrum_temelj", label: { sr: "Podrum / temelj", en: "Basement / foundation", ru: "Подвал / фундамент" } },
                { value: "ravni_krov", label: { sr: "Ravni krov", en: "Flat roof", ru: "Плоская кровля" } },
                { value: "terasa_balkon", label: { sr: "Terasa / balkon", en: "Terrace / balcony", ru: "Терраса / балкон" } },
                { value: "mokri_cvor", label: { sr: "Mokri čvor (kupatilo, kuhinja)", en: "Wet room (bathroom, kitchen)", ru: "Мокрая зона (ванная, кухня)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Ukupna površina", en: "Total area", ru: "Общая площадь" },
              importance: "required",
              unit: "m²",
              predefined: [10, 20, 30, 50, 80, 100],
              unknownAllowed: true,
            },
            {
              key: "sistem",
              kind: "select",
              label: { sr: "Sistem hidroizolacije", en: "Waterproofing system", ru: "Система гидроизоляции" },
              importance: "optional",
              options: [
                { value: "bitumenska_traka", label: { sr: "Bitumenska traka (varenjem)", en: "Bituminous membrane (torch-on)", ru: "Битумная лента (наплавляемая)" } },
                { value: "teckona_membrana", label: { sr: "Tečna membrana (premaz)", en: "Liquid applied membrane", ru: "Жидкая мембрана (обмазочная)" } },
                { value: "bentonitske_ploce", label: { sr: "Bentonitske ploče (podrum)", en: "Bentonite panels (basement)", ru: "Бентонитовые плиты (подвал)" } },
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
      label: { sr: "Krov", en: "Roof", ru: "Кровля" },
      icon: "triangle",
      subcategories: [
        {
          id: "krov_zamena_pokrivaca",
          label: { sr: "Zamena krovnog pokrivača", en: "Roof covering replacement", ru: "Замена кровельного покрытия" },
          fields: [
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina krova (kosa)", en: "Roof area (pitched)", ru: "Площадь кровли (скатной)" },
              importance: "required",
              unit: "m²",
              predefined: [50, 80, 100, 150, 200, 300],
              unknownAllowed: true,
            },
            {
              key: "stari_pokrivac",
              kind: "select",
              label: { sr: "Postojeći pokrivač", en: "Existing cover", ru: "Существующее покрытие" },
              importance: "optional",
              options: [
                { value: "crepe", label: { sr: "Crep (glineni/betonski)", en: "Clay/concrete tiles", ru: "Черепица (глиняная/бетонная)" } },
                { value: "salonit", label: { sr: "Salonit / eternit", en: "Fibre cement / Eternit", ru: "Волнистый шифер / Eternit" } },
                { value: "lim", label: { sr: "Lim (pocinkovani/poliester)", en: "Metal sheet (galvanised/coated)", ru: "Металлический лист (оцинкованный/покрытый)" } },
                { value: "bitumenske_sindrile", label: { sr: "Bitumenske šindre", en: "Bitumen shingles", ru: "Битумная черепица" } },
              ],
            },
            {
              key: "novi_pokrivac",
              kind: "select",
              label: { sr: "Novi pokrivač", en: "New cover", ru: "Новое покрытие" },
              importance: "required",
              options: [
                { value: "crepe_glineni", label: { sr: "Glineni crep", en: "Clay tiles", ru: "Глиняная черепица" } },
                { value: "crepe_betonski", label: { sr: "Betonski crep", en: "Concrete tiles", ru: "Бетонная черепица" } },
                { value: "lim_trapezni", label: { sr: "Trapezni lim", en: "Trapezoidal metal sheet", ru: "Трапециевидный металлический лист" } },
                { value: "lim_stojeca_falc", label: { sr: "Stojeća falc (premium lim)", en: "Standing seam (premium metal)", ru: "Фальцевая кровля (премиум металл)" } },
                { value: "bitumenske_sindrile", label: { sr: "Bitumenske šindre", en: "Bitumen shingles", ru: "Битумная черепица" } },
                { value: "solarne_ploce_krov", label: { sr: "Solarne ploče (integrisane)", en: "Solar tiles (integrated)", ru: "Солнечные панели (интегрированные)" } },
              ],
            },
            {
              key: "demontaza",
              kind: "toggle",
              label: { sr: "Demontaža i odvoz starog pokrivača", en: "Remove and dispose of old cover", ru: "Демонтаж и вывоз старого покрытия" },
              importance: "required",
            },
            {
              key: "podkrovlje_hidroizolacija",
              kind: "toggle",
              label: { sr: "Ugradnja podkrovne hidroizolacione folije", en: "Install roofing underlay membrane", ru: "Монтаж подкровельной гидроизоляционной плёнки" },
              importance: "optional",
            },
          ],
        },
        {
          id: "krov_termoizolacija_potkrovlja",
          label: { sr: "Termoizolacija potkrovlja", en: "Loft / attic insulation", ru: "Утепление мансарды / чердака" },
          fields: [
            {
              key: "tip",
              kind: "select",
              label: { sr: "Način izolacije", en: "Insulation method", ru: "Метод утепления" },
              importance: "required",
              options: [
                { value: "izmedju_rogova", label: { sr: "Između rogova (kamena vuna + GK)", en: "Between rafters (rock wool + plasterboard)", ru: "Между стропилами (каменная вата + ГКЛ)" } },
                { value: "pod_tavanicu", label: { sr: "Tavanica potkrovlja (ispuniti šljunkom / celulozom)", en: "Flat ceiling (loose fill / cellulose)", ru: "Чердачное перекрытие (засыпка / целлюлоза)" } },
                { value: "sprej_pena", label: { sr: "Sprej pena (PU foam)", en: "Spray foam (PU)", ru: "Напыляемая пена (ПУ)" } },
              ],
            },
            {
              key: "povrsina",
              kind: "area",
              label: { sr: "Površina potkrovlja", en: "Loft area", ru: "Площадь мансарды" },
              importance: "required",
              unit: "m²",
              predefined: [30, 50, 80, 100, 150],
              unknownAllowed: true,
            },
            {
              key: "obloga",
              kind: "toggle",
              label: { sr: "Ugradnja gips-karton obloge", en: "Install plasterboard lining", ru: "Монтаж гипсокартонной обшивки" },
              importance: "optional",
            },
          ],
        },
        {
          id: "krov_reparatura",
          label: { sr: "Reparatura / krpljenje krova", en: "Roof repair / patch", ru: "Ремонт / латание кровли" },
          fields: [
            {
              key: "opseg",
              kind: "select",
              label: { sr: "Obim oštećenja", en: "Damage extent", ru: "Объём повреждений" },
              importance: "required",
              options: [
                { value: "manje_od_10m2", label: { sr: "Manje oštećenje (< 10 m²)", en: "Minor damage (< 10 m²)", ru: "Незначительные повреждения (< 10 m²)" } },
                { value: "10_do_30m2", label: { sr: "Srednje (10–30 m²)", en: "Moderate (10–30 m²)", ru: "Средние (10–30 m²)" } },
                { value: "vise_od_30m2", label: { sr: "Veće oštećenje (> 30 m²) — preporučuje se kompletna zamena", en: "Significant (> 30 m²) — full replacement may be better", ru: "Значительные повреждения (> 30 m²) — рекомендуется полная замена" } },
              ],
            },
            {
              key: "uzrok",
              kind: "select",
              label: { sr: "Uzrok", en: "Cause", ru: "Причина" },
              importance: "optional",
              options: [
                { value: "pukli_crepovi", label: { sr: "Puknuti / pomereni crepovi", en: "Cracked / displaced tiles", ru: "Треснутая / сдвинутая черепица" } },
                { value: "oštećena_obloga", label: { sr: "Oštećena limena obloga", en: "Damaged flashing", ru: "Повреждённая металлическая облицовка" } },
                { value: "truli_rogovi", label: { sr: "Truli rogovi / letva", en: "Rotten rafters / battens", ru: "Гнилые стропила / обрешётка" } },
                { value: "prokišnjava", label: { sr: "Prokišnjava (nepoznat uzrok)", en: "Leaking (unknown cause)", ru: "Протечка (неизвестная причина)" } },
              ],
            },
            {
              key: "napomena",
              kind: "text",
              label: { sr: "Opis problema", en: "Problem description", ru: "Описание проблемы" },
              importance: "niceToHave",
              placeholder: { sr: "Opišite gde i kako prokišnjava, šta ste primetili...", en: "Describe where and how it leaks, what you've noticed...", ru: "Опишите где и как протекает, что вы заметили..." },
            },
          ],
        },
      ],
    },

  ],
};
