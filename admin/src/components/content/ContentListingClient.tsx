"use client";

import { useMemo, useState } from "react";
import {
  matchesContentSearch,
  sortContentItems,
} from "@shared/content/helpers";
import type { BaseContentItem, ContentLocale, ContentSortOption } from "@shared/content/types";
import { ContentCard } from "./ContentCard";

const UI_COPY = {
  sr: {
    eyebrow: "Resursni centar",
    search: "Pretraga po naslovu, uvodu ili tekstu...",
    allCategories: "Sve kategorije",
    sort: {
      newest: "Najnovije prvo",
      oldest: "Najstarije prvo",
      shortest: "Najkrace citanje",
      longest: "Najduze citanje",
    },
    noResultsTitle: "Nema rezultata za izabrane filtere.",
    noResultsBody: "Probajte drugu rec, kategoriju ili sortiranje.",
    reset: "Reset filtera",
  },
  en: {
    eyebrow: "Resource hub",
    search: "Search by title, excerpt, or content...",
    allCategories: "All categories",
    sort: {
      newest: "Newest first",
      oldest: "Oldest first",
      shortest: "Shortest read",
      longest: "Longest read",
    },
    noResultsTitle: "No results for current filters.",
    noResultsBody: "Try a different keyword, category, or sorting option.",
    reset: "Reset filters",
  },
  ru: {
    eyebrow: "Центр ресурсов",
    search: "Поиск по заголовку, описанию или тексту...",
    allCategories: "Все категории",
    sort: {
      newest: "Сначала новые",
      oldest: "Сначала старые",
      shortest: "Короткое чтение",
      longest: "Длинное чтение",
    },
    noResultsTitle: "Нет результатов по текущим фильтрам.",
    noResultsBody: "Попробуйте другой запрос, категорию или сортировку.",
    reset: "Сбросить фильтры",
  },
} as const;

export function ContentListingClient({
  title,
  description,
  items,
  allRouteHref,
  detailBasePath,
  ctaLabel,
  locale,
}: {
  title: string;
  description: string;
  items: BaseContentItem[];
  allRouteHref: string;
  detailBasePath: string;
  ctaLabel: string;
  locale: ContentLocale;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<ContentSortOption>("newest");
  const ui = UI_COPY[locale];
  const sortOptions: Array<{ value: ContentSortOption; label: string }> = [
    { value: "newest", label: ui.sort.newest },
    { value: "oldest", label: ui.sort.oldest },
    { value: "shortest-read", label: ui.sort.shortest },
    { value: "longest-read", label: ui.sort.longest },
  ];

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    items.forEach((item) => item.categories.forEach((tag) => categorySet.add(tag)));
    return [...categorySet].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const bySearch = items.filter((item) => matchesContentSearch(item, query));
    const byCategory = category === "all" ? bySearch : bySearch.filter((item) => item.categories.includes(category));
    return sortContentItems(byCategory, sortBy);
  }, [items, query, category, sortBy]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <section style={{ borderBottom: "1px solid var(--bdr)", background: "linear-gradient(175deg,#FDFBF8 0%,var(--bg) 100%)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 34px" }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>
            {ui.eyebrow}
          </p>
          <h1
            style={{
              fontFamily: "var(--heading)",
              fontWeight: 500,
              fontSize: "clamp(30px,4.2vw,44px)",
              letterSpacing: "-.02em",
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            {title}
          </h1>
          <p style={{ maxWidth: 740, color: "var(--ink3)", lineHeight: 1.72, fontSize: 15 }}>
            {description}
          </p>
        </div>
      </section>

      <section style={{ padding: "22px 24px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            className="card content-filter-grid"
            style={{
              padding: "16px 16px",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 12,
            }}
          >
            <input
              className="finput"
              placeholder={ui.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className="fselect" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">{ui.allCategories}</option>
              {categories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <select className="fselect" value={sortBy} onChange={(event) => setSortBy(event.target.value as ContentSortOption)}>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section style={{ padding: "24px 24px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: "30px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 8 }}>{ui.noResultsTitle}</p>
              <p style={{ fontSize: 12.5, color: "var(--ink4)" }}>
                {ui.noResultsBody}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                gap: 16,
              }}
            >
              {filtered.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  href={`${detailBasePath}/${item.slug}?lang=${locale}`}
                  ctaLabel={ctaLabel}
                  locale={locale}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <a href={`${allRouteHref}?lang=${locale}`} className="btn-g">
              {ui.reset}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
