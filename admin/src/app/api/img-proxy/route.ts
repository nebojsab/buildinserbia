import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return new NextResponse("Missing url", { status: 400 });

  let imageUrl: string;
  try {
    imageUrl = decodeURIComponent(raw);
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BuildInSerbia/1.0; +https://buildinserbia.rs)",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) return new NextResponse("Upstream error", { status: upstream.status });

    const ct = (upstream.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
    if (!ALLOWED_CONTENT_TYPES.has(ct)) return new NextResponse("Not an image", { status: 415 });

    const buf = await upstream.arrayBuffer();

    return new NextResponse(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
