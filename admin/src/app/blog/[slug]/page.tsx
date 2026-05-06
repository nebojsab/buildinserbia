import Link from "next/link";
import { notFound } from "next/navigation";
import { formatContentDate } from "@shared/content/helpers";
import { localizeContentItem, normalizeLocale } from "@shared/content/localize";
import { getServerPublishedContentByType } from "@/lib/contentStoreServer";
import { ContentCard } from "@/components/content/ContentCard";
import {
  ContentMetaRow,
  DetailShell,
  RichTextArticle,
} from "@/components/content/RichTextArticle";
import { PublicSiteChrome } from "@/components/content/PublicSiteChrome";

const COPY = {
  sr: {
    breadcrumbRoot: "Blog",
    section: "Povezani tekstovi",
    body: "Istrazite dodatne uvide o gradnji i renoviranju.",
    back: "← Nazad na sve blog tekstove",
    cta: "Procitaj tekst",
  },
  en: {
    breadcrumbRoot: "Blog",
    section: "Related posts",
    body: "Explore additional construction and renovation insights.",
    back: "← Back to all blog posts",
    cta: "Read post",
  },
  ru: {
    breadcrumbRoot: "Блог",
    section: "Похожие статьи",
    body: "Изучите дополнительные материалы по строительству и ремонту.",
    back: "← Ко всем статьям",
    cta: "Читать статью",
  },
} as const;

export default async function BlogDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = normalizeLocale(sp?.lang);
  const published = await getServerPublishedContentByType("blog");
  const baseItem = published.find((entry) => entry.slug === slug);
  const item = baseItem ? localizeContentItem(baseItem, locale) : undefined;
  if (!item) notFound();
  const related = published
    .filter((entry) => entry.id !== item.id)
    .map((entry) => {
      const localizedEntry = localizeContentItem(entry, locale);
      return {
        entry,
        score: localizedEntry.categories.filter((tag) => item.categories.includes(tag)).length,
      };
    })
    .sort((a, b) => b.score - a.score || +new Date(b.entry.createdAt) - +new Date(a.entry.createdAt))
    .slice(0, 3)
    .map(({ entry }) => localizeContentItem(entry, locale));
  const copy = COPY[locale];

  return (
    <PublicSiteChrome locale={locale} currentPath={`/blog/${slug}`}>
      <DetailShell
        breadcrumb={
          <>
            <Link href={`/blog?lang=${locale}`} style={{ color: "var(--ink3)" }}>
              {copy.breadcrumbRoot}
            </Link>
            <span style={{ margin: "0 8px", color: "var(--ink4)" }}>/</span>
            <span>{item.title}</span>
          </>
        }
        title={item.title}
        meta={
          <ContentMetaRow
            tags={item.categories}
            dateLabel={formatContentDate(item.createdAt)}
            author={item.author}
            readingTime={item.readingTime ?? 1}
            locale={locale}
          />
        }
      >
        <article
          style={{
            border: "1px solid var(--bdr)",
            background: "var(--card)",
            borderRadius: 16,
            padding: "22px 24px",
          }}
        >
          <div
            style={{
              aspectRatio: "16 / 8",
              borderRadius: 12,
              border: "1px solid var(--bdr)",
              background: item.coverImage
                ? `center / cover no-repeat url(${item.coverImage})`
                : "linear-gradient(145deg, rgba(19,66,121,.10), rgba(19,66,121,.08))",
              marginBottom: 18,
            }}
          />
          <RichTextArticle body={item.body} compactNumberedHeadings />
        </article>

        <section style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 500, marginBottom: 8 }}>{copy.section}</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 14 }}>
            {copy.body}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
            {related.map((entry) => (
              <ContentCard
                key={entry.id}
                item={entry}
                href={`/blog/${entry.slug}?lang=${locale}`}
                ctaLabel={copy.cta}
                locale={locale}
              />
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href={`/blog?lang=${locale}`} className="btn-g">
              {copy.back}
            </Link>
          </div>
        </section>
      </DetailShell>
    </PublicSiteChrome>
  );
}
