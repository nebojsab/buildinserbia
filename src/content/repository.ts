import { calculateReadingTimeMinutes, generateExcerptFromBody, slugify } from "./helpers";
import type { BaseContentItem, ContentLocale, ContentType, LocalizedContentFields } from "./types";
import {
  localesBlog7Mistakes,
  localesBlogRealisticBudget,
  localesBlogContractorQuestions,
  localesBlogTradeSequencing,
  localesBlogMissedCosts,
  localesBlogPermitTiming,
} from "./blogLocaleBundles";
import {
  localesDocPreConstructionSerbia,
  localesDocRenovationBudgetChecklist,
  localesDocContractorOfferChecklist,
  localesDocSiteReadiness,
  localesDocUtilityInfrastructure,
  localesDocPermitsTimeline,
} from "./docLocaleBundles";

export const DOCUMENT_CATEGORIES_BY_LOCALE: Record<ContentLocale, readonly string[]> = {
  sr: [
    "Priprema gradnje",
    "Dozvole i dokumentacija",
    "Budzetiranje",
    "Planiranje",
    "Renoviranje",
    "Materijali",
    "Infrastruktura i prikljucci",
    "Pravno i vlasnistvo",
    "Checkliste",
    "Vodici",
  ],
  en: [
    "Pre-Construction",
    "Permits & Documentation",
    "Budgeting",
    "Planning",
    "Renovation",
    "Materials",
    "Infrastructure & Utilities",
    "Legal & Ownership",
    "Checklists",
    "Guides",
  ],
  ru: [
    "Подготовка к строительству",
    "Разрешения и документация",
    "Бюджетирование",
    "Планирование",
    "Ремонт",
    "Материалы",
    "Инфраструктура и подключения",
    "Право и собственность",
    "Чек-листы",
    "Гайды",
  ],
};

export const BLOG_CATEGORIES_BY_LOCALE: Record<ContentLocale, readonly string[]> = {
  sr: [
    "Saveti za gradnju",
    "Saveti za renoviranje",
    "Dozvole",
    "Troskovi i budzet",
    "Planiranje",
    "Greske koje treba izbeci",
    "Materijali",
    "Trziste Srbije",
    "Vodici",
    "Studije slucaja",
  ],
  en: [
    "Construction Tips",
    "Renovation Tips",
    "Permits",
    "Costs & Budget",
    "Planning",
    "Mistakes to Avoid",
    "Materials",
    "Serbia Market",
    "Guides",
    "Case Studies",
  ],
  ru: [
    "Советы по строительству",
    "Советы по ремонту",
    "Разрешения",
    "Расходы и бюджет",
    "Планирование",
    "Ошибки, которых стоит избегать",
    "Материалы",
    "Рынок Сербии",
    "Гайды",
    "Кейсы",
  ],
};

function primaryLocaleFields(item: BaseContentItem): LocalizedContentFields {
  const { sr, en, ru } = item.locales;
  if (sr.title.trim() && sr.body.trim()) return sr;
  if (en.title.trim() && en.body.trim()) return en;
  return ru;
}

const SEEDED_CONTENT: BaseContentItem[] = [
  {
    id: "blog-7-mistakes-before-renovation-starts",
    type: "blog",
    title: localesBlog7Mistakes.sr.title,
    slug: "7-mistakes-people-make-before-renovation-starts",
    coverImage: "/Logo.svg",
    excerpt: localesBlog7Mistakes.sr.excerpt,
    body: localesBlog7Mistakes.sr.body,
    categories: [...localesBlog7Mistakes.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-04-02T09:00:00.000Z",
    readingTime: 8,
    publishStatus: "published",
    featured: true,
    locales: localesBlog7Mistakes,
  },
  {
    id: "blog-realistic-renovation-budget",
    type: "blog",
    title: localesBlogRealisticBudget.sr.title,
    slug: "how-to-build-a-realistic-renovation-budget",
    coverImage: "/Logo.svg",
    excerpt: localesBlogRealisticBudget.sr.excerpt,
    body: localesBlogRealisticBudget.sr.body,
    categories: [...localesBlogRealisticBudget.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-03-27T09:00:00.000Z",
    readingTime: 7,
    publishStatus: "published",
    featured: true,
    locales: localesBlogRealisticBudget,
  },
  {
    id: "blog-contractor-offer-questions",
    type: "blog",
    title: localesBlogContractorQuestions.sr.title,
    slug: "questions-to-ask-a-contractor-before-accepting-an-offer",
    coverImage: "/Logo.svg",
    excerpt: localesBlogContractorQuestions.sr.excerpt,
    body: localesBlogContractorQuestions.sr.body,
    categories: [...localesBlogContractorQuestions.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-03-18T09:00:00.000Z",
    readingTime: 6,
    publishStatus: "published",
    locales: localesBlogContractorQuestions,
  },
  {
    id: "blog-trade-sequencing-quality",
    type: "blog",
    title: localesBlogTradeSequencing.sr.title,
    slug: "how-trade-sequencing-affects-renovation-quality",
    coverImage: "/Logo.svg",
    excerpt: localesBlogTradeSequencing.sr.excerpt,
    body: localesBlogTradeSequencing.sr.body,
    categories: [...localesBlogTradeSequencing.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-03-12T09:00:00.000Z",
    readingTime: 5,
    publishStatus: "published",
    locales: localesBlogTradeSequencing,
  },
  {
    id: "blog-missed-renovation-costs",
    type: "blog",
    title: localesBlogMissedCosts.sr.title,
    slug: "what-people-often-miss-when-planning-renovation-costs",
    coverImage: "/Logo.svg",
    excerpt: localesBlogMissedCosts.sr.excerpt,
    body: localesBlogMissedCosts.sr.body,
    categories: [...localesBlogMissedCosts.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-03-05T09:00:00.000Z",
    readingTime: 5,
    publishStatus: "published",
    locales: localesBlogMissedCosts,
  },
  {
    id: "blog-permit-checks-inputs-timing",
    type: "blog",
    title: localesBlogPermitTiming.sr.title,
    slug: "when-permits-checks-and-technical-inputs-should-happen",
    coverImage: "/Logo.svg",
    excerpt: localesBlogPermitTiming.sr.excerpt,
    body: localesBlogPermitTiming.sr.body,
    categories: [...localesBlogPermitTiming.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-02-27T09:00:00.000Z",
    readingTime: 4,
    publishStatus: "published",
    locales: localesBlogPermitTiming,
  },
  {
    id: "doc-pre-construction-documents-serbia",
    type: "document",
    title: localesDocPreConstructionSerbia.sr.title,
    slug: "pre-construction-documents-in-serbia",
    coverImage: "/Logo.svg",
    excerpt: localesDocPreConstructionSerbia.sr.excerpt,
    body: localesDocPreConstructionSerbia.sr.body,
    categories: [...localesDocPreConstructionSerbia.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-02-25T09:00:00.000Z",
    readingTime: 10,
    publishStatus: "published",
    featured: true,
    attachments: [
      {
        id: "att-pre-construction-pdf",
        name: "pre-construction-documents-in-serbia.pdf",
        fileUrl: "/downloads/documents/pre-construction-documents-in-serbia.pdf",
        fileType: "pdf",
        fileSize: "1.2 MB",
        uploadedAt: "2026-02-25T09:00:00.000Z",
      },
      {
        id: "att-pre-construction-docx",
        name: "pre-construction-documents-in-serbia.docx",
        fileUrl: "/downloads/documents/pre-construction-documents-in-serbia.docx",
        fileType: "docx",
        fileSize: "320 KB",
        uploadedAt: "2026-02-25T09:00:00.000Z",
      },
    ],
    locales: localesDocPreConstructionSerbia,
  },
  {
    id: "doc-renovation-budget-checklist",
    type: "document",
    title: localesDocRenovationBudgetChecklist.sr.title,
    slug: "renovation-budget-checklist",
    coverImage: "/Logo.svg",
    excerpt: localesDocRenovationBudgetChecklist.sr.excerpt,
    body: localesDocRenovationBudgetChecklist.sr.body,
    categories: [...localesDocRenovationBudgetChecklist.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-02-20T09:00:00.000Z",
    readingTime: 4,
    publishStatus: "published",
    featured: true,
    locales: localesDocRenovationBudgetChecklist,
  },
  {
    id: "doc-contractor-offer-review-checklist",
    type: "document",
    title: localesDocContractorOfferChecklist.sr.title,
    slug: "contractor-offer-review-checklist",
    coverImage: "/Logo.svg",
    excerpt: localesDocContractorOfferChecklist.sr.excerpt,
    body: localesDocContractorOfferChecklist.sr.body,
    categories: [...localesDocContractorOfferChecklist.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-02-14T09:00:00.000Z",
    readingTime: 4,
    publishStatus: "published",
    locales: localesDocContractorOfferChecklist,
  },
  {
    id: "doc-site-readiness-checklist-before-works-start",
    type: "document",
    title: localesDocSiteReadiness.sr.title,
    slug: "site-readiness-checklist-before-works-start",
    coverImage: "/Logo.svg",
    excerpt: localesDocSiteReadiness.sr.excerpt,
    body: localesDocSiteReadiness.sr.body,
    categories: [...localesDocSiteReadiness.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-02-09T09:00:00.000Z",
    readingTime: 4,
    publishStatus: "published",
    locales: localesDocSiteReadiness,
  },
  {
    id: "doc-utility-and-infrastructure-review-guide",
    type: "document",
    title: localesDocUtilityInfrastructure.sr.title,
    slug: "utility-and-infrastructure-review-guide",
    coverImage: "/Logo.svg",
    excerpt: localesDocUtilityInfrastructure.sr.excerpt,
    body: localesDocUtilityInfrastructure.sr.body,
    categories: [...localesDocUtilityInfrastructure.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-02-04T09:00:00.000Z",
    readingTime: 5,
    publishStatus: "published",
    locales: localesDocUtilityInfrastructure,
  },
  {
    id: "doc-permits-and-inputs-timeline-guide",
    type: "document",
    title: localesDocPermitsTimeline.sr.title,
    slug: "permits-and-technical-inputs-timeline-guide",
    coverImage: "/Logo.svg",
    excerpt: localesDocPermitsTimeline.sr.excerpt,
    body: localesDocPermitsTimeline.sr.body,
    categories: [...localesDocPermitsTimeline.sr.categories],
    author: "BuildInSerbia Editorial",
    createdAt: "2026-01-29T09:00:00.000Z",
    readingTime: 5,
    publishStatus: "published",
    locales: localesDocPermitsTimeline,
  },
];

function normalizeContent(item: BaseContentItem): BaseContentItem {
  const primary = primaryLocaleFields(item);
  const nextSlug = item.slug?.trim() ? item.slug : slugify(primary.title);
  const excerpt = primary.excerpt.trim() || generateExcerptFromBody(primary.body);
  return {
    ...item,
    title: primary.title,
    body: primary.body,
    excerpt,
    categories: primary.categories,
    slug: nextSlug,
    readingTime: item.readingTime ?? calculateReadingTimeMinutes(primary.body),
  };
}

function allContent(): BaseContentItem[] {
  return SEEDED_CONTENT.map(normalizeContent);
}

export function getAllContentByType(type: ContentType): BaseContentItem[] {
  return allContent().filter((item) => item.type === type);
}

export function getPublishedContentByType(type: ContentType): BaseContentItem[] {
  return getAllContentByType(type).filter((item) => item.publishStatus === "published");
}

export function getPublishedContentBySlug(type: ContentType, slug: string): BaseContentItem | undefined {
  return getPublishedContentByType(type).find((item) => item.slug === slug);
}

export function getRelatedPublishedContent(
  type: ContentType,
  currentItemId: string,
  limit = 3,
): BaseContentItem[] {
  const published = getPublishedContentByType(type);
  const current = published.find((item) => item.id === currentItemId);
  if (!current) return published.filter((item) => item.id !== currentItemId).slice(0, limit);

  const scored = published
    .filter((item) => item.id !== currentItemId)
    .map((item) => {
      const shared = item.categories.filter((category) => current.categories.includes(category)).length;
      return { item, score: shared };
    })
    .sort((a, b) => b.score - a.score || +new Date(b.item.createdAt) - +new Date(a.item.createdAt));

  return scored.slice(0, limit).map((entry) => entry.item);
}

export function getHighlightedPublishedDocuments(limit = 4): BaseContentItem[] {
  const items = getPublishedContentByType("document");
  const featured = items.filter((item) => item.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return [...featured, ...items.filter((item) => !item.featured)].slice(0, limit);
}
