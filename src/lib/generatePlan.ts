import { TASK_AFF } from "../constants/affiliate";
import type { Lang } from "../translations";
import type { GeneratedPlan, PlanForm, PlanStep, ProjectType } from "../types/plan";

/* ════════════════════════════════════════════════════════
   PLAN GENERATOR
════════════════════════════════════════════════════════ */
export function generatePlan(form: PlanForm, lang: Lang): GeneratedPlan {
  const { projectType, tasks, size, userType, infra } = form;
  if (!projectType) {
    throw new Error("generatePlan: projectType is required");
  }
  const sz = parseInt(size) || 100;
  const isForeigner = userType === 1;
  const isMicro = tasks.length === 1;
  const infraPartial = infra === 1;
  const infraNone    = infra === 2;

  /* Cost bases per m² */
  const BASE = {
    newbuild:{ lo:600, hi:1200 },
    reno:    { lo:200, hi:550  },
    extension:{ lo:500, hi:1050 },
    interior:{ lo:120, hi:350  },
    yard:    { lo:60,  hi:180  },
  };

  /* Per-task costs (flat, not per m²) */
  const TASK_COST = {
    foundations:{ lo:sz*80,  hi:sz*160  },
    walls:      { lo:sz*90,  hi:sz*180  },
    roof:       { lo:sz*70,  hi:sz*140  },
    installations:{ lo:sz*60,hi:sz*120  },
    finishing:  { lo:sz*80,  hi:sz*160  },
    fullbuild:  { lo:sz*600, hi:sz*1200 },
    ufh:        { lo:sz*40,  hi:sz*90   },
    winreplace: { lo:800,    hi:2000    },  // per window × ~10
    flooring:   { lo:sz*25,  hi:sz*70   },
    bathreno:   { lo:3000,   hi:9000    },
    electrical: { lo:sz*20,  hi:sz*50   },
    plumbing:   { lo:sz*15,  hi:sz*40   },
    insulation: { lo:sz*30,  hi:sz*75   },
    fullreno:   { lo:sz*200, hi:sz*550  },
    furniture:  { lo:sz*80,  hi:sz*250  },
    kitchen:    { lo:2500,   hi:8000    },
    bathequip:  { lo:1500,   hi:5000    },
    lighting:   { lo:sz*8,   hi:sz*25   },
    decor:      { lo:sz*15,  hi:sz*50   },
    leveling:   { lo:sz*5,   hi:sz*20   },
    lawn:       { lo:sz*8,   hi:sz*25   },
    irrigation: { lo:1000,   hi:3500    },
    fence:      { lo:800,    hi:2500    },
    gate:       { lo:600,    hi:2000    },
    paths:      { lo:sz*15,  hi:sz*40   },
    outdoorlight:{ lo:500,   hi:2000    },
  };

  /* Compute cost */
  let lo = 0, hi = 0;
  if(isMicro){
    const tk = tasks[0];
    const c = TASK_COST[tk as keyof typeof TASK_COST];
    if(c){ lo = c.lo; hi = c.hi; }
    else {
      const b = BASE[projectType as keyof typeof BASE];
      lo = sz * (b?.lo ?? 200);
      hi = sz * (b?.hi ?? 600);
    }
  } else {
    if(tasks.includes("fullbuild") || tasks.includes("fullreno")){
      lo = sz * (BASE[projectType as keyof typeof BASE]?.lo ?? 200);
      hi = sz * (BASE[projectType as keyof typeof BASE]?.hi ?? 600);
    } else {
      tasks.forEach(tk => {
        const c = TASK_COST[tk as keyof typeof TASK_COST];
        if(c){ lo += c.lo; hi += c.hi; }
      });
    }
  }
  if(infraNone){ lo = Math.round(lo*1.15); hi = Math.round(hi*1.25); }

  /* Steps per task */
  const STEPS = {
    sr:{
      foundations:["Geotehnički elaborat i priprema terena","Iskop za temelje prema projektu","Betoniranje temeljne ploče ili trake","Hidroizolacija i zaštita temelja","Zasipanje i nabijanje terena oko temelja"],
      walls:["Postavljanje zidnih blokova (porobeton, cigla, beton)","Horizontalni serklaži na svakom spratu","Vertikalni serklaži i armatura","Fasadna termoizolacija i malterisanje"],
      roof:["Montaža krovne konstrukcije (drvena ili čelična)","Postavljanje hidroizolacione folije","Montaža crepa ili ravnog krovnog sistema","Opšivke, olučni sistem i odvodnjavanje"],
      installations:["Razrada projekta instalacija (elektro, VIK, grejanje)","Uvođenje priključaka","Razvod cevi i kablova u zidovima","Montaža razvodnih tabli i spojnica","Priključenje trošila i testiranje"],
      finishing:["Gletovanje i izravnavanje zidova","Postavljanje podnih obloga","Montaža unutrašnjih vrata i prozorskih okvira","Farbanje i finalne dekorativne obrade","Montaža sanitarija i opreme"],
      fullbuild:["Pribavljanje građevinske dozvole","Priprema terena i temelji","Grubi građevinski radovi — zidovi i krov","Instalacije: struja, voda, grejanje","Fasada i spoljašnja stolarija","Unutrašnji završni radovi","Opremanje i nameštanje","Tehnički prijem i upotrebna dozvola"],
      ufh:["Demontaža postojećih podova (ako je potrebno)","Polaganje izolacione ploče","Postavljanje sistema podnog grejanja","Zalijevanje estrihom ili aneksom","Povezivanje sa grejnim sistemom i testiranje"],
      winreplace:["Snimanje tačnih dimenzija otvora","Nabavka prozora prema energetskim standardima","Demontaža starih prozora","Montaža novih prozora sa kitovanjem i zaptivanjem","Unutrašnje i spoljašnje dorade oko prozora"],
      flooring:["Priprema podloge — izravnavanje i sušenje","Postavljanje izolacione podloge","Polaganje podnih obloga (laminat, parket, keramika…)","Montaža lajsni i završnica","Čišćenje i zaštita"],
      bathreno:["Demolacija pločica i sanitarija","Hidroizolacija zidova i poda","Postavljanje novih pločica","Montaža sanitarija: tus/kada, WC, lavabo","Montaža armatura i finalni radovi"],
      electrical:["Projektovanje nove elektroinstalacije","Demontaža stare instalacije","Razvod kablova u zidovima","Montaža utičnica, prekidača i rasvete","Priključenje na mrežu i testiranje"],
      plumbing:["Projektovanje novih instalacija","Demontaža starih cevi","Postavljanje novih PP ili bakarne instalacije","Priključenje na vodovodnu mrežu","Testiranje pritiska i zaptivnosti"],
      insulation:["Priprema fasadne podloge","Postavljanje termoizolacionih ploča","Armaturni sloj i osnovna masa","Završni fasadni sistem ili obrada","Termoizolacija krova (ako je potrebno)"],
      fullreno:["Snimanje stanja i izrada plana renoviranja","Pribavljanje dozvola (ako su potrebne)","Demolacija i uklanjanje materijala","Grubi građevinski radovi i ojačanja","Obnova instalacija","Izravnavanje i gletovanje","Postavljanje podnih obloga","Montaža prozora i vrata","Farbanje i dekoracija","Sanitarije i oprema","Nameštanje"],
      furniture:["Merenje prostora i izrada plana nameštanja","Naručivanje ili nabavka nameštaja","Montaža nameštaja","Postavljanje dekorativnih elemenata","Finalni raspored i detalji"],
      kitchen:["Merenje i projektovanje kuhinjskog rešenja","Naručivanje kuhinjskih elemenata","Montaža donje i gornje kuhinje","Ugradnja radnih površina i perilice","Priključenje ugrađenih uređaja"],
      bathequip:["Odabir sanitarnih elemenata","Montaža WC šolje i lavabo","Montaža tus kabine ili kade","Montaža sušača za veš i ogledala","Priključenje armatura"],
      lighting:["Plan rasvetnih tačaka po prostorijama","Nabavka rasvete i materijala","Razvod instalacije (u saradnji sa elektricherom)","Montaža rasvete","Testiranje i podešavanje"],
      decor:["Odabir dekorativnih elemenata","Postavljanje zavesa i roleta","Montaža polica i dekorativnih panela","Uređenje biljkama i elementima","Fotografisanje finalnog enterijera"],
      leveling:["Geodetsko snimanje terena","Mašinsko nivelisanje i uklanjanje viška zemlje","Nasipanje i nabijanje šljunka ili drobljenca","Drenaža i odvodnjavanje terena","Priprema za naredne radove"],
      lawn:["Priprema tla — rahljenje i đubrenje","Nivelisanje površine","Sejetva ili postavljanje busena","Navodnjavanje u periodu nicanja","Košenje i nega u prvoj sezoni"],
      irrigation:["Projektovanje sistema za navodnjavanje","Iskop rova za razvod cevi","Postavljanje kapajućih ili sprinkler sistema","Priključenje na vodovod ili pumpu","Testiranje i podešavanje tajmera"],
      fence:["Geodetsko obeležavanje granice parcele","Iskop za temelje stubova","Betoniranje stubova","Montaža platna ili panela","Zaštitna obrada (boja, pocinčavanje)"],
      gate:["Merenje otvora kapije","Nabavka kapije ili naručivanje po meri","Montaža stubova i kapije","Elektromotor (opcija za automatska vrata)","Testiranje i podešavanje"],
      paths:["Planiranje trase staza","Iskop i priprema podloge","Postavljanje drobljenca ili betona","Polaganje betonskih ploča, kaldrme ili dekinga","Ivičnjaci i ivičenje"],
      outdoorlight:["Plan tačaka osvetljenja","Iskop rova za podzemne kablove","Postavljanje instalacije","Montaža armatuda i rasvete","Testiranje i noćno podešavanje"],
    },
    en:{
      foundations:["Geotechnical survey and site preparation","Excavation to design depth","Concrete strip/slab foundation pour","Waterproofing and damp-proof membrane","Backfill and compaction"],
      walls:["Lay blockwork or brickwork to floor levels","Horizontal ring beams at each floor","Vertical reinforced concrete columns","External insulation and render system"],
      roof:["Erect roof structure (timber or steel)","Install waterproof underlay membrane","Fix roof tiles or flat-roof system","Flashings, guttering and drainage"],
      installations:["Design services layout (electrical, plumbing, heating)","Connect to main supplies","First-fix pipe and cable runs","Install distribution boards and junctions","Second-fix and testing"],
      finishing:["Skim coat and plaster walls and ceilings","Lay floor finishes","Fix internal doors and window boards","Paint and decorative finishes","Install sanitaryware and fittings"],
      fullbuild:["Obtain building permit (građevinska dozvola)","Site preparation and foundations","Shell structure — walls and roof","Utilities: electrical, plumbing, heating","External facade and windows","Interior finishing works","Furnishing and fit-out","Technical inspection and occupancy permit"],
      ufh:["Remove existing floor (if needed)","Lay insulation board","Install underfloor heating pipes/cable","Pour screed over system","Connect to heat source and commission"],
      winreplace:["Measure all openings precisely","Order windows to energy standards","Remove existing windows","Fit new windows with seals and trims","Internal and external finishing around reveals"],
      flooring:["Prepare subfloor — level and dry","Lay underlay","Install floor finish (laminate, hardwood, tile…)","Fit skirting boards and trims","Clean and protect"],
      bathreno:["Strip existing tiles and fittings","Waterproof walls and floor","Tile walls and floor","Install sanitaryware: shower/bath, WC, basin","Fit brassware and finish"],
      electrical:["Design new electrical layout","Strip old wiring","First-fix cable routes","Install sockets, switches and lighting points","Connect to supply and commission"],
      plumbing:["Design new pipe layout","Strip old pipes","Install new water supply and waste pipes","Connect to mains","Pressure test and commission"],
      insulation:["Prepare facade substrate","Fix insulation boards","Apply reinforcement mesh and base coat","Apply finish coat or cladding system","Roof insulation if required"],
      fullreno:["Survey existing condition and plan works","Obtain permits if structural changes planned","Strip-out and demolition","Structural repairs and reinforcement","Renew utilities","Plastering and levelling","Floor finishes","Windows and doors","Painting and decoration","Sanitaryware and fittings","Furnishing"],
      furniture:["Measure rooms and create furniture plan","Order or source furniture","Assemble and install","Arrange decorative items","Final styling"],
      kitchen:["Measure and design kitchen layout","Order units and worktops","Install base and wall units","Fit worktops and appliances","Connect built-in appliances"],
      bathequip:["Select sanitaryware","Install WC and basin","Install shower enclosure or bath","Fit towel rails and mirrors","Connect brassware"],
      lighting:["Plan lighting points per room","Source fittings and materials","First-fix wiring (with electrician)","Install light fittings","Test and adjust"],
      decor:["Select soft furnishings and décor","Hang curtains and blinds","Install shelving and panels","Style with plants and accessories","Final photography"],
      leveling:["Topographic survey","Machine-level site and remove excess","Import and compact hardcore/gravel","Install drainage","Prepare for subsequent works"],
      lawn:["Prepare topsoil — loosen and fertilise","Level surface","Seed or lay turf","Water through germination period","Cut and maintain through first season"],
      irrigation:["Design irrigation layout","Trench for pipe runs","Install drip or sprinkler system","Connect to mains or pump","Test and programme timer"],
      fence:["Survey and peg boundary","Dig post holes","Concrete posts in","Fix panels or mesh","Apply protective finish"],
      gate:["Measure gate opening","Source or fabricate gate","Fix posts and hang gate","Electric opener (optional)","Test and adjust"],
      paths:["Plan routes","Excavate and prepare sub-base","Hardcore or concrete base","Lay flags, cobbles or decking","Edge restraints and finishing"],
      outdoorlight:["Plan lighting positions","Trench for underground cables","Install conduit and wiring","Fit luminaires","Test and night-time adjustment"],
    },
    ru:{
      foundations:["Геотехническое исследование и подготовка площадки","Экскавация под фундамент по проекту","Заливка монолитной плиты или ленточного фундамента","Гидроизоляция и защита фундамента","Обратная засыпка и трамбовка"],
      walls:["Кладка блоков или кирпича по этажам","Горизонтальные пояса жёсткости на каждом уровне","Вертикальные армированные колонны","Наружное утепление и штукатурка фасада"],
      roof:["Монтаж кровельной конструкции (дерево или сталь)","Укладка гидроизоляционной мембраны","Монтаж черепицы или плоской кровельной системы","Примыкания, водосточная система и дренаж"],
      installations:["Разработка проекта коммуникаций (электрика, водопровод, отопление)","Подключение к основным сетям","Прокладка труб и кабелей","Монтаж распределительных щитов","Подключение потребителей и тестирование"],
      finishing:["Шпатлёвка и выравнивание стен и потолков","Укладка напольных покрытий","Монтаж внутренних дверей и подоконников","Покраска и декоративная отделка","Установка сантехники и оборудования"],
      fullbuild:["Получение разрешения на строительство","Подготовка площадки и фундамент","Коробка здания — стены и крыша","Коммуникации: электрика, водопровод, отопление","Фасад и наружные оконные блоки","Внутренняя отделка","Меблировка и оснащение","Технический приём и разрешение на ввод в эксплуатацию"],
      ufh:["Демонтаж существующего пола (при необходимости)","Укладка теплоизоляционной подложки","Монтаж системы тёплого пола","Заливка стяжки","Подключение к источнику тепла и наладка"],
      winreplace:["Точный замер проёмов","Заказ окон по энергетическим стандартам","Демонтаж старых окон","Монтаж новых окон с уплотнением и отделкой","Внутренние и наружные откосы"],
      flooring:["Подготовка основания — выравнивание и сушка","Укладка подложки","Монтаж напольного покрытия (ламинат, паркет, плитка…)","Установка плинтусов и порожков","Очистка и защитная обработка"],
      bathreno:["Демонтаж плитки и сантехники","Гидроизоляция стен и пола","Укладка новой плитки","Монтаж сантехники: душ/ванна, унитаз, раковина","Установка смесителей и финальная отделка"],
      electrical:["Проектирование новой электросети","Демонтаж старой проводки","Прокладка новых кабелей","Монтаж розеток, выключателей и светильников","Подключение и тестирование"],
      plumbing:["Проектирование новых трубопроводов","Демонтаж старых труб","Монтаж водопроводных и канализационных труб","Подключение к сети","Испытание давлением"],
      insulation:["Подготовка фасадного основания","Монтаж теплоизоляционных плит","Армирующий слой и базовая штукатурка","Декоративная штукатурка или облицовка","Утепление кровли при необходимости"],
      fullreno:["Обследование и составление плана ремонта","Получение разрешений при перепланировке","Демонтажные работы","Конструктивные усиления","Обновление коммуникаций","Штукатурка и выравнивание","Напольные покрытия","Окна и двери","Покраска и декор","Сантехника и оборудование","Меблировка"],
      furniture:["Обмер помещений и составление плана расстановки","Заказ или покупка мебели","Сборка и установка","Расстановка декоративных элементов","Финальный стайлинг"],
      kitchen:["Замер и проектирование кухни","Заказ гарнитура и столешниц","Монтаж нижних и верхних шкафов","Установка столешниц и встраиваемой техники","Подключение техники"],
      bathequip:["Выбор сантехники","Монтаж унитаза и раковины","Монтаж душевой кабины или ванны","Установка полотенцесушителя и зеркала","Подключение смесителей"],
      lighting:["Планирование точек освещения","Закупка светильников","Прокладка проводки (с электриком)","Монтаж светильников","Тестирование и настройка"],
      decor:["Выбор декоративных элементов","Установка штор и жалюзи","Монтаж полок и декоративных панелей","Расстановка растений и аксессуаров","Финальная фотосессия"],
      leveling:["Топографическая съёмка","Машинная планировка и вывоз грунта","Отсыпка и уплотнение щебня","Устройство дренажа","Подготовка к дальнейшим работам"],
      lawn:["Подготовка почвы — рыхление и удобрение","Выравнивание поверхности","Посев или укладка рулонного газона","Полив в период прорастания","Кошение и уход в первый сезон"],
      irrigation:["Проектирование системы полива","Прокладка траншей для труб","Монтаж капельного или спринклерного орошения","Подключение к водопроводу или насосу","Тестирование и настройка таймера"],
      fence:["Геодезическая разметка границ участка","Бурение/копка ям для столбов","Установка столбов на бетон","Монтаж секций или сетки","Защитная обработка"],
      gate:["Замер проёма ворот","Заказ или изготовление ворот","Монтаж столбов и навеска","Электропривод (по желанию)","Тестирование и регулировка"],
      paths:["Планирование трасс дорожек","Земляные работы и подготовка основания","Отсыпка щебнем или бетонное основание","Укладка плитки, брусчатки или декинга","Бордюры и обрамление"],
      outdoorlight:["Планирование точек освещения","Прокладка траншей для кабелей","Монтаж кабелей","Установка светильников","Тестирование и ночная настройка"],
    },
  };

  /* Notes per task + general */
  const NOTES = {
    sr:{
      general:[
        "Uvek pribavite minimum 3 pisane ponude od izvođača pre angažovanja.",
        "Cene materijala u Srbiji mogu varirati 20–40% između regiona.",
        "Proverite uknjižbu parcele/objekta u katastru pre početka radova.",
      ],
      newbuild:"Građevinska dozvola u Srbiji obično traje 1–4 meseca. Angažujte ovlašćenog arhitektu na vreme.",
      reno:"Za strukturalne promene možda su potrebne dozvole. Konsultujte opštinu.",
      extension:"Nadogradnja često zahteva projekat i građevinsku dozvolu — proverite opštinu i postojeći objekat.",
      interior:"Koordinišite nabavku nameštaja unapred — rokovi isporuke mogu biti 6–12 nedelja.",
      yard:"Proverite katastar za granicu parcele pre postavljanja ograde.",
      foreigner:"Kao strani kupac: angažujte lokalnog advokata za proveru vlasništva i procedure kupovine.",
    },
    en:{
      general:[
        "Always obtain at least 3 written quotes from contractors before committing.",
        "Material costs in Serbia can vary 20–40% by region.",
        "Verify property registration in the cadastre (katastar) before starting works.",
      ],
      newbuild:"Building permits in Serbia typically take 1–4 months. Engage a licensed architect well in advance.",
      reno:"Structural changes may require planning permission. Check with your local municipality (opština).",
      extension:"Extensions usually need a design package and may require a building permit — verify with your municipality.",
      interior:"Co-ordinate furniture orders early — lead times can be 6–12 weeks.",
      yard:"Check the cadastre for your exact boundary before erecting fencing.",
      foreigner:"As a foreign buyer: engage a local solicitor to verify ownership and navigate the purchase process.",
    },
    ru:{
      general:[
        "Всегда запрашивайте минимум 3 письменных предложения от подрядчиков.",
        "Цены на материалы в Сербии могут отличаться на 20–40% в зависимости от региона.",
        "Проверьте регистрацию в кадастре перед началом работ.",
      ],
      newbuild:"Разрешение на строительство в Сербии оформляется 1–4 месяца. Заблаговременно привлеките архитектора.",
      reno:"Перепланировка может требовать разрешений. Уточните в местной управе (opština).",
      extension:"Пристройка обычно требует проект и может потребовать разрешения — уточните в общине и по существующему дому.",
      interior:"Заказывайте мебель заблаговременно — сроки поставки могут составлять 6–12 недель.",
      yard:"Перед установкой забора уточните точные границы участка в кадастре.",
      foreigner:"Как иностранному покупателю: привлеките местного юриста для проверки права собственности.",
    },
  };

  /* Next steps */
  const NEXT = {
    sr:{
      newbuild:["Kontaktirajte ovlašćenog arhitektu u vašem regionu","Pribavite minimum 3 ponude za grube radove","Proverite lokalne uslove u vašoj opštini"],
      reno:["Angažujte iskusnog izvođača za snimanje stanja","Zatražite ponude od minimum 3 izvođača","Proverite da li su potrebne dozvole"],
      extension:["Angažujte arhitektu za projekat nadogradnje i statiku postojećeg objekta","Proverite dozvole u opštini i uslove priključenja","Pribavite minimum 3 ponude od izvođača specijalizovanih za dogradnje"],
      interior:["Izradite plan nameštanja sa arhitektom enterijera","Naručite nameštaj sa dovoljnim predrokom","Koordinišite sa elektricharom za rasvetu"],
      yard:["Proverite katastarski plan parcele","Angažujte pejzažnog arhitektu za plan dvorišta","Pribavite ponude za zemljane radove"],
    },
    en:{
      newbuild:["Engage a licensed architect in your region","Obtain 3+ quotes for structural works","Check local planning conditions with your municipality"],
      reno:["Hire an experienced contractor to survey existing condition","Request 3+ quotes","Check if permits are required"],
      extension:["Commission an architect for extension design and review existing structure","Confirm permit requirements with your municipality and utility connections","Obtain 3+ quotes from contractors experienced in extensions"],
      interior:["Create a furniture layout plan with an interior designer","Order furniture with sufficient lead time","Coordinate with an electrician for lighting"],
      yard:["Check your cadastre boundary plan","Engage a landscape designer for a yard plan","Obtain quotes for groundworks"],
    },
    ru:{
      newbuild:["Найдите лицензированного архитектора в вашем регионе","Запросите минимум 3 предложения на строительные работы","Уточните местные требования в общине"],
      reno:["Привлеките опытного подрядчика для обследования","Запросите минимум 3 коммерческих предложения","Проверьте необходимость разрешений"],
      extension:["Закажите проект пристройки и проверку несущей конструкции существующего дома","Уточните разрешения в общине и условия подключения коммуникаций","Запросите минимум 3 предложения у подрядчиков с опытом пристроек"],
      interior:["Составьте план расстановки мебели с дизайнером интерьера","Заказывайте мебель с запасом по срокам","Согласуйте с электриком расположение освещения"],
      yard:["Проверьте кадастровый план участка","Привлеките ландшафтного дизайнера","Запросите сметы на земляные работы"],
    },
  };

  /* Build step list */
  const allSteps: PlanStep[] = [];
  const seen = new Set<string>();
  const effectiveTasks = tasks.includes("fullbuild") ? ["fullbuild"] :
                         tasks.includes("fullreno")  ? ["fullreno"]  : tasks;

  const langSteps = STEPS[lang] as Record<string, string[]>;
  effectiveTasks.forEach((tk) => {
    const taskSteps = langSteps[tk] || [];
    taskSteps.forEach((s: string) => {
      if (!seen.has(s)) {
        seen.add(s);
        allSteps.push({ step: s, task: tk });
      }
    });
  });

  /* Affiliate keys */
  const affKeysRaw = new Set<string>();
  effectiveTasks.forEach((tk) => {
    const row = TASK_AFF[tk as keyof typeof TASK_AFF] || [];
    row.forEach((k) => affKeysRaw.add(k));
  });
  if(infraNone){ affKeysRaw.add("solar"); affKeysRaw.add("septic"); }
  if(infraPartial){ affKeysRaw.add("heating"); }
  const affKeys = [...affKeysRaw].slice(0,6);

  /* Infra extras */
  const infraExtras: { key: string; note: string }[] = [];
  if (infraNone) {
    const infraN = NOTES[lang] as typeof NOTES[typeof lang] & { solar?: string; septic?: string };
    infraExtras.push({ key: "solar", note: infraN.solar || "" });
    infraExtras.push({ key: "septic", note: infraN.septic || "" });
  }

  /* Notes */
  const pt = projectType as ProjectType;
  const notes = [
    ...NOTES[lang].general,
    ...(NOTES[lang][pt] ? [NOTES[lang][pt] as string] : []),
    ...(isForeigner && NOTES[lang].foreigner ? [NOTES[lang].foreigner] : []),
  ];

  return {
    isMicro,
    projectType,
    tasks: effectiveTasks,
    steps: allSteps,
    costs: { lo: Math.round(lo), hi: Math.round(hi) },
    affKeys, notes, infraExtras,
    next: NEXT[lang]?.[pt] || [],
    infraPartial, infraNone,
  };
}
