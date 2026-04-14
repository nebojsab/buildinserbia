export type DocEntry = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
};

export type DocumentLibraryPayload = {
  documents: DocEntry[];
  categories: string[];
};

function resolveAdminBase(): string {
  const viteBase =
    typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ADMIN_BASE_URL
      ? (import.meta as any).env.VITE_ADMIN_BASE_URL
      : undefined;
  const nextBase =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_BASE_URL
      ? process.env.NEXT_PUBLIC_ADMIN_BASE_URL
      : undefined;
  return viteBase ?? nextBase ?? "";
}

const ADMIN_BASE = resolveAdminBase();

export async function fetchDocuments(): Promise<DocumentLibraryPayload> {
  try {
    const base = ADMIN_BASE;
    const ts = Date.now();
    const url = base ? `${base}/api/documents?ts=${ts}` : `/api/documents?ts=${ts}`;
    const res = await fetch(url, {
      cache: "no-store",
      mode: "cors",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return { documents: [], categories: [] };
    return (await res.json()) as DocumentLibraryPayload;
  } catch {
    return { documents: [], categories: [] };
  }
}
