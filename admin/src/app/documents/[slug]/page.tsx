import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatContentDate,
} from "@shared/content/helpers";
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
    section: "Povezani dokumenti",
    sectionBody: "Nastavite sa povezanim prakticnim vodicima i checklistama.",
    back: "← Nazad na sve dokumente",
    downloadsTitle: "Preuzmi ovaj dokument",
    downloadsBody: "Preuzmite dostupne fajlove za ovaj dokument u PDF ili DOCX formatu.",
    noDownloads: "Jos uvek nema dostupnih fajlova za preuzimanje.",
    downloadPdf: "Preuzmi PDF",
    downloadDocx: "Preuzmi DOCX",
    download: "Preuzmi",
    cta: "Pogledaj dokument",
    breadcrumbRoot: "Dokumenti",
  },
  en: {
    section: "Related documents",
    sectionBody: "Continue with related practical documents and planning checklists.",
    back: "← Back to all documents",
    downloadsTitle: "Download this document",
    downloadsBody: "Download the available files for this document in PDF or DOCX format.",
    noDownloads: "No downloadable files are available for this document yet.",
    downloadPdf: "Download PDF",
    downloadDocx: "Download DOCX",
    download: "Download",
    cta: "View document",
    breadcrumbRoot: "Documents",
  },
  ru: {
    section: "Похожие документы",
    sectionBody: "Продолжите с релевантными гайдами и чек-листами.",
    back: "← Ко всем документам",
    downloadsTitle: "Скачать документ",
    downloadsBody: "Скачайте доступные файлы для этого документа в формате PDF или DOCX.",
    noDownloads: "Для этого документа пока нет доступных файлов.",
    downloadPdf: "Скачать PDF",
    downloadDocx: "Скачать DOCX",
    download: "Скачать",
    cta: "Открыть документ",
    breadcrumbRoot: "Документы",
  },
} as const;

export default async function DocumentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = normalizeLocale(sp?.lang);
  const published = await getServerPublishedContentByType("document");
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
  const attachments = item.attachments ?? [];
  const copy = COPY[locale];

  return (
    <PublicSiteChrome locale={locale} currentPath={`/documents/${slug}`}>
      <DetailShell
        breadcrumb={
          <>
            <Link href={`/documents?lang=${locale}`} style={{ color: "var(--ink3)" }}>
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
        <div
          className="content-print-shell"
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
                : "linear-gradient(145deg, rgba(196,92,46,.13), rgba(29,78,216,.08))",
              marginBottom: 18,
            }}
          />

          <RichTextArticle body={item.body} />
        </div>

        <section className="content-no-print card" style={{ marginTop: 18, padding: "16px 18px" }}>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
            {copy.downloadsTitle}
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--ink3)", lineHeight: 1.62, marginBottom: 12 }}>
            {copy.downloadsBody}
          </p>
          {attachments.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "var(--ink4)" }}>{copy.noDownloads}</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {attachments.map((attachment) => {
                const isPdf = attachment.fileType === "pdf";
                const typeLabel = isPdf ? "PDF" : "DOCX";
                const ctaLabel = isPdf
                  ? copy.downloadPdf
                  : attachment.fileType === "docx"
                    ? copy.downloadDocx
                    : copy.download;
                return (
                  <div
                    key={attachment.id}
                    className="card"
                    style={{
                      borderRadius: 10,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {isPdf ? "📄" : "📝"} {attachment.name}
                      </p>
                      <p style={{ fontSize: 11.5, color: "var(--ink4)" }}>
                        {typeLabel}
                        {attachment.fileSize ? ` • ${attachment.fileSize}` : ""}
                      </p>
                    </div>
                    <a href={attachment.fileUrl} className="btn-g" download>
                      {ctaLabel}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="content-no-print" style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 500, marginBottom: 8 }}>{copy.section}</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 14 }}>
            {copy.sectionBody}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
            {related.map((entry) => (
              <ContentCard
                key={entry.id}
                item={entry}
                href={`/documents/${entry.slug}?lang=${locale}`}
                ctaLabel={copy.cta}
                locale={locale}
              />
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Link href={`/documents?lang=${locale}`} className="btn-g">
              {copy.back}
            </Link>
          </div>
        </section>
      </DetailShell>
    </PublicSiteChrome>
  );
}
