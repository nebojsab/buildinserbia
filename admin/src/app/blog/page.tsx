import { localizeContentItem, normalizeLocale } from "@shared/content/localize";
import { ContentListingClient } from "@/components/content/ContentListingClient";
import { PublicSiteChrome } from "@/components/content/PublicSiteChrome";
import { getServerPublishedContentByType } from "@/lib/contentStoreServer";

const COPY = {
  sr: {
    title: "Blog",
    description:
      "Prakticni saveti, uvide i objasnjenja o gradnji, renoviranju, troskovima, dozvolama i tipicnim greskama pri projektima u Srbiji.",
    cta: "Procitaj tekst",
  },
  en: {
    title: "Blog",
    description:
      "Insights, practical tips, and explainers about construction, renovation, costs, permits, planning, and common mistakes when building in Serbia.",
    cta: "Read post",
  },
  ru: {
    title: "Блог",
    description:
      "Практические советы и разборы о строительстве, ремонте, бюджете, разрешениях и частых ошибках при проектах в Сербии.",
    cta: "Читать статью",
  },
} as const;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const locale = normalizeLocale(sp?.lang);
  const items = (await getServerPublishedContentByType("blog")).map((item) =>
    localizeContentItem(item, locale),
  );
  const copy = COPY[locale];
  return (
    <PublicSiteChrome locale={locale} currentPath="/blog">
      <ContentListingClient
        title={copy.title}
        description={copy.description}
        items={items}
        detailBasePath="/blog"
        allRouteHref="/blog"
        ctaLabel={copy.cta}
        locale={locale}
      />
    </PublicSiteChrome>
  );
}
