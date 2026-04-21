import { localizeContentItem, normalizeLocale } from "@shared/content/localize";
import { ContentListingClient } from "@/components/content/ContentListingClient";
import { PublicSiteChrome } from "@/components/content/PublicSiteChrome";
import { getServerPublishedContentByType } from "@/lib/contentStoreServer";

const COPY = {
  sr: {
    title: "Dokumenti",
    description:
      "Prakticni vodici, checkliste i resursi za planiranje gradnje, renoviranja, dozvola i pripremnih koraka u Srbiji.",
    cta: "Pogledaj dokument",
  },
  en: {
    title: "Documents",
    description:
      "Practical guides, checklists, and planning resources for building, renovation, permits, documentation, and pre-construction steps in Serbia.",
    cta: "View document",
  },
  ru: {
    title: "Документы",
    description:
      "Практические гайды, чек-листы и материалы по строительству, ремонту, разрешениям и подготовке проекта в Сербии.",
    cta: "Открыть документ",
  },
} as const;

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const locale = normalizeLocale(sp?.lang);
  const items = (await getServerPublishedContentByType("document")).map((item) =>
    localizeContentItem(item, locale),
  );
  const copy = COPY[locale];
  return (
    <PublicSiteChrome locale={locale} currentPath="/documents">
      <ContentListingClient
        title={copy.title}
        description={copy.description}
        items={items}
        detailBasePath="/documents"
        allRouteHref="/documents"
        ctaLabel={copy.cta}
        locale={locale}
      />
    </PublicSiteChrome>
  );
}
