import { put } from "@vercel/blob";

const canUseBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const BLOB_HOST_PATTERN = /\.public\.blob\.vercel-storage\.com/;

export async function mirrorImageToBlob(
  externalUrl: string,
  productId: string,
): Promise<string> {
  if (!canUseBlob) return externalUrl;
  if (BLOB_HOST_PATTERN.test(externalUrl)) return externalUrl;

  const res = await fetch(externalUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "image/*,*/*;q=0.8",
      "Accept-Language": "sr-RS,sr;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`Upstream ${res.status}`);

  const ct = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
  const ext = EXT_MAP[ct] ?? "jpg";
  const buf = await res.arrayBuffer();

  const blobPath = `catalog-images/${productId}.${ext}`;
  const blob = await put(blobPath, buf, {
    access: "public",
    contentType: ct,
    allowOverwrite: true,
  });

  return blob.url;
}
