import JSZip from "jszip";

export function safeFileName(input: string): string {
  const normalized = input.trim().replace(/\s+/g, "-");
  return normalized.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase() || "file";
}

export async function zipToDownloadResponse(zip: JSZip, fileName: string): Promise<Response> {
  const payload = await zip.generateAsync({ type: "uint8array" });
  const arrayBuffer = new ArrayBuffer(payload.byteLength);
  new Uint8Array(arrayBuffer).set(payload);
  return new Response(arrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
