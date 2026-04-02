/**
 * Base URL of the public marketing site (Vite app), without trailing slash.
 * Set `NEXT_PUBLIC_PUBLIC_SITE_URL` in production (e.g. https://www.example.com).
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "http://localhost:5173";
}
