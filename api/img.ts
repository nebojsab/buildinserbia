import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
  if (!raw) return res.status(400).send("Missing url");

  let imageUrl: string;
  try {
    imageUrl = decodeURIComponent(raw);
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("bad protocol");
  } catch {
    return res.status(400).send("Invalid url");
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BuildInSerbia/1.0; +https://buildinserbia.rs)",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) return res.status(upstream.status).send("Upstream error");

    const ct = (upstream.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
    if (!ALLOWED_CONTENT_TYPES.has(ct)) return res.status(415).send("Not an image");

    const buf = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.send(buf);
  } catch {
    return res.status(502).send("Failed to fetch image");
  }
}
