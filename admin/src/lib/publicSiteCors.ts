/**
 * Reflect Origin for credentialed fetches from the public Vite app (other port / subdomain).
 * Set CORS_ORIGIN_PUBLIC in production to your public site URL(s), comma-separated.
 */
export function publicSiteCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const extra = process.env.CORS_ORIGIN_PUBLIC?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (extra?.includes(origin)) return origin;

  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return origin;
  } catch {
    return null;
  }

  return null;
}

export function corsHeaders(request: Request): Headers {
  const h = new Headers();
  const o = publicSiteCorsOrigin(request);
  if (o) {
    h.set("Access-Control-Allow-Origin", o);
    h.set("Access-Control-Allow-Credentials", "true");
    h.set("Vary", "Origin");
  }
  return h;
}
