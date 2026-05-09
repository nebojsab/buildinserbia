import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://buildinserbia.com")
  .replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/backup/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
