/**
 * Base URL of the public site, without trailing slash.
 * Set `NEXT_PUBLIC_PUBLIC_SITE_URL` in production (e.g. https://www.example.com).
 * When not set, fall back to same-origin root so we never hardcode localhost ports.
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "";
}
