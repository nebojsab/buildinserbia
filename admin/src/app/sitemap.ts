import type { MetadataRoute } from "next";
import { getServerPublishedContentByType } from "@/lib/contentStoreServer";

const BASE_URL = (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://buildinserbia.com")
  .replace(/\/+$/, "");

/** Static routes with their relative priority and update frequency */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: `${BASE_URL}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/renovacija`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/izgradnja`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/dogradnja`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/dvoriste`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/documents`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch published blog posts and documents for dynamic routes
  const [blogItems, docItems] = await Promise.all([
    getServerPublishedContentByType("blog").catch(() => []),
    getServerPublishedContentByType("document").catch(() => []),
  ]);

  const blogRoutes: MetadataRoute.Sitemap = blogItems
    .filter((item) => item.slug)
    .map((item) => ({
      url: `${BASE_URL}/blog/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const docRoutes: MetadataRoute.Sitemap = docItems
    .filter((item) => item.slug)
    .map((item) => ({
      url: `${BASE_URL}/documents/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...STATIC_ROUTES, ...blogRoutes, ...docRoutes];
}
