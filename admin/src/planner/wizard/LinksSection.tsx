import { findMunicipalityPortal } from "../lib/municipalityPortals";

type Lang = "sr" | "en" | "ru";

type LinkItem = {
  label: string;
  sublabel?: string;
  url: string;
  icon: string;
  tag?: string;
};

type LinkGroup = {
  title: string;
  links: LinkItem[];
};

function googleSearch(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// Category-specific professional links
const CAT_LINKS: Record<string, { sr: LinkItem[]; en: LinkItem[]; ru: LinkItem[] }> = {
  fasada_izolacija: {
    sr: [{ label: "SRPS EN standardi za fasadne sisteme", sublabel: "ISS — Institut za standardizaciju Srbije", url: "https://www.iss.rs", icon: "📋" }],
    en: [{ label: "SRPS EN facade system standards", sublabel: "ISS Serbia", url: "https://www.iss.rs", icon: "📋" }],
    ru: [{ label: "Стандарты SRPS EN для фасадных систем", sublabel: "ISS — Институт стандартизации Сербии", url: "https://www.iss.rs", icon: "📋" }],
  },
  elektrika: {
    sr: [{ label: "Registar licenciranih izvođača EE radova", sublabel: "Ministarstvo rudarstva i energetike", url: "https://www.mre.gov.rs", icon: "⚡" }],
    en: [{ label: "Licensed electrical contractor registry", sublabel: "Ministry of Mining and Energy", url: "https://www.mre.gov.rs", icon: "⚡" }],
    ru: [{ label: "Реестр лицензированных электромонтажников", sublabel: "Министерство горного дела и энергетики", url: "https://www.mre.gov.rs", icon: "⚡" }],
  },
  grejanje: {
    sr: [{ label: "Energetski portal Srbije", sublabel: "Informacije o toplotnim pumpama i energetskoj efikasnosti", url: "https://www.energetskiportal.rs", icon: "🔥" }],
    en: [{ label: "Serbia Energy Portal", sublabel: "Heat pumps and energy efficiency info", url: "https://www.energetskiportal.rs", icon: "🔥" }],
    ru: [{ label: "Энергетический портал Сербии", sublabel: "Тепловые насосы и энергоэффективность", url: "https://www.energetskiportal.rs", icon: "🔥" }],
  },
};

export function LinksSection({
  lang,
  municipality,
  selectedCategories,
}: {
  lang: string;
  municipality: string | undefined;
  selectedCategories: string[];
}) {
  const l: Lang = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
  const muni = municipality?.trim() || "";
  const muniShort = muni.replace(/,.*$/, "").trim(); // "Novi Banovci" from "Novi Banovci, Opština Stara Pazova"
  const muniPortal = muni ? findMunicipalityPortal(muni) : null;

  const groups: LinkGroup[] = [];

  // ── 1. Local municipality ──────────────────────────────────
  const localLinks: LinkItem[] = [];

  if (muniPortal) {
    localLinks.push({
      label: muniPortal.name,
      sublabel: l === "sr" ? "Zvanični portal opštine / grada" : l === "ru" ? "Официальный портал общины / города" : "Official municipal portal",
      url: muniPortal.url,
      icon: "🏛",
      tag: l === "sr" ? "Zvanično" : l === "ru" ? "Официально" : "Official",
    });
  } else if (muni) {
    localLinks.push({
      label: l === "sr" ? `Portal opštine / grada` : l === "ru" ? "Портал общины / города" : "Municipal portal",
      sublabel: l === "sr" ? "Pronađite zvanični portal vaše opštine" : l === "ru" ? "Найдите официальный портал вашей общины" : "Find the official portal for your municipality",
      url: googleSearch(l === "sr" ? `opština ${muniShort} zvanični portal` : l === "ru" ? `општина ${muniShort} официальный сайт` : `${muniShort} municipality official portal`),
      icon: "🏛",
    });
  }

  if (muni) {
    localLinks.push(
      {
        label: l === "sr" ? `Arhitektonski biroi — ${muniShort}` : l === "ru" ? `Архитектурные бюро — ${muniShort}` : `Architecture offices — ${muniShort}`,
        sublabel: l === "sr" ? "Pretražite lokalne arhitekte i projektante" : l === "ru" ? "Найдите местных архитекторов и проектировщиков" : "Search for local architects and designers",
        url: googleSearch(l === "sr" ? `arhitektonski biro ${muniShort}` : l === "ru" ? `архитектурное бюро ${muniShort} Сербия` : `architecture office ${muniShort} Serbia`),
        icon: "📐",
      },
      {
        label: l === "sr" ? `Geodetski biroi — ${muniShort}` : l === "ru" ? `Геодезические бюро — ${muniShort}` : `Geodetic offices — ${muniShort}`,
        sublabel: l === "sr" ? "Geodeti za snimanje, parcelaciju i legalizaciju" : l === "ru" ? "Геодезисты для съёмки, межевания и легализации" : "Surveyors for mapping, parcelation and legalisation",
        url: googleSearch(l === "sr" ? `geodetski biro ${muniShort}` : l === "ru" ? `геодезия ${muniShort} Сербия` : `geodetic surveyor ${muniShort} Serbia`),
        icon: "🗺",
      },
      {
        label: l === "sr" ? `Izvođači radova — ${muniShort}` : l === "ru" ? `Подрядчики — ${muniShort}` : `Contractors — ${muniShort}`,
        sublabel: l === "sr" ? "Lokalni građevinski izvođači i majstori" : l === "ru" ? "Местные строительные подрядчики и мастера" : "Local construction contractors and tradespeople",
        url: googleSearch(l === "sr" ? `izvođač građevinskih radova ${muniShort}` : l === "ru" ? `строительный подрядчик ${muniShort} Сербия` : `construction contractor ${muniShort} Serbia`),
        icon: "🔨",
      },
    );
  }

  if (localLinks.length > 0) {
    groups.push({
      title: l === "sr" ? `Lokalno${muni ? ` — ${muniShort}` : ""}` : l === "ru" ? `Местное${muni ? ` — ${muniShort}` : ""}` : `Local${muni ? ` — ${muniShort}` : ""}`,
      links: localLinks,
    });
  }

  // ── 2. National portals ────────────────────────────────────
  groups.push({
    title: l === "sr" ? "Nacionalni servisi" : l === "ru" ? "Национальные сервисы" : "National services",
    links: [
      {
        label: l === "sr" ? "E-uprava" : l === "ru" ? "Электронное правительство" : "E-Government Portal",
        sublabel: l === "sr" ? "Zahtevi za dozvole, e-šalter, javne usluge" : l === "ru" ? "Заявки на разрешения, электронный сервис, госуслуги" : "Building permits, e-counter, public services",
        url: "https://euprava.gov.rs",
        icon: "🖥",
        tag: "euprava.gov.rs",
      },
      {
        label: l === "sr" ? "RGZ — Republički geodetski zavod" : l === "ru" ? "RGZ — Республиканский геодезический институт" : "RGZ — Geodetic Authority of Serbia",
        sublabel: l === "sr" ? "Katastar nepokretnosti, parcele, kopija plana" : l === "ru" ? "Кадастр недвижимости, участки, копии планов" : "Cadastre, parcel data, plan copies",
        url: "https://www.rgz.gov.rs",
        icon: "📍",
        tag: "rgz.gov.rs",
      },
      {
        label: l === "sr" ? "Ministarstvo građevinarstva" : l === "ru" ? "Министерство строительства" : "Ministry of Construction",
        sublabel: l === "sr" ? "Propisi, licenciranje izvođača, tehnički uslovi" : l === "ru" ? "Нормативы, лицензирование подрядчиков, технические условия" : "Regulations, contractor licensing, technical conditions",
        url: "https://www.mgsi.gov.rs",
        icon: "📜",
        tag: "mgsi.gov.rs",
      },
      {
        label: l === "sr" ? "Inženjing komora Srbije" : l === "ru" ? "Инженерная палата Сербии" : "Engineering Chamber of Serbia",
        sublabel: l === "sr" ? "Registar licenciranih inženjera i arhitekata" : l === "ru" ? "Реестр лицензированных инженеров и архитекторов" : "Registry of licensed engineers and architects",
        url: "https://www.ingkomora.rs",
        icon: "🏗",
        tag: "ingkomora.rs",
      },
      {
        label: l === "sr" ? "Centralni registar dozvola (CEOP)" : l === "ru" ? "Центральный реестр разрешений (CEOP)" : "Central Building Permit Register (CEOP)",
        sublabel: l === "sr" ? "Podnošenje i praćenje zahteva za građevinsku dozvolu" : l === "ru" ? "Подача и отслеживание заявок на разрешение на строительство" : "Submit and track building permit applications",
        url: "https://ceop.apr.gov.rs",
        icon: "📋",
        tag: "ceop.apr.gov.rs",
      },
    ],
  });

  // ── 3. Category-specific extras ───────────────────────────
  const extraLinks: LinkItem[] = [];
  for (const catId of selectedCategories) {
    const catData = CAT_LINKS[catId];
    if (catData) extraLinks.push(...(catData[l] ?? catData.sr));
  }
  if (extraLinks.length > 0) {
    groups.push({ title: l === "sr" ? "Specifično za vaše radove" : l === "ru" ? "Специфично для ваших работ" : "Specific to your works", links: extraLinks });
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--ink3)", marginBottom: 12 }}>
        {l === "sr" ? "Korisni linkovi i kontakti" : l === "ru" ? "Полезные ссылки и контакты" : "Useful links & contacts"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map((grp) => (
          <div key={grp.title}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--ink4)", marginBottom: 8 }}>
              {grp.title}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
              {grp.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 13px", background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: "var(--r)", transition: "border-color .15s, box-shadow .15s", height: "100%" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--acc)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 8px rgba(0,0,0,.06)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--bdr)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{link.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, marginBottom: 2 }}>
                        {link.label}
                        {link.tag && (
                          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 600, letterSpacing: ".04em", color: "var(--ink4)", background: "var(--bgw)", border: "1px solid var(--bdr)", borderRadius: 4, padding: "1px 5px", verticalAlign: "middle" }}>
                            {link.tag}
                          </span>
                        )}
                      </div>
                      {link.sublabel && (
                        <div style={{ fontSize: "0.75rem", color: "var(--ink3)", lineHeight: 1.4 }}>{link.sublabel}</div>
                      )}
                    </div>
                    <svg style={{ flexShrink: 0, marginLeft: "auto", marginTop: 2, color: "var(--ink4)" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
