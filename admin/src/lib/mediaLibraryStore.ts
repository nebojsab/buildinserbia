export type MediaKind = "image" | "video";

export type MediaItem = {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  url: string;
  kind: MediaKind;
  addedAt: string;
  categories: string[];
};

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "webp"];
const VIDEO_EXTENSIONS = ["mp4"];
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("bis-media-library-updated"));
}

export async function getMediaLibraryItems(): Promise<MediaItem[]> {
  const response = await fetch("/api/media", {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Ne mogu da ucitam media biblioteku.");
  }
  const payload = (await response.json()) as { items?: MediaItem[] };
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
}

export function isSupportedMediaFile(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.includes(extension);
}

export function mediaKindFromFileName(fileName: string): MediaKind | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(extension)) return "image";
  if (VIDEO_EXTENSIONS.includes(extension)) return "video";
  return null;
}

function normalizeMediaCategories(categories: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawCategory of categories) {
    const value = rawCategory.trim().replace(/\s+/g, " ");
    if (!value) continue;
    const lower = value.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    normalized.push(value);
  }

  return normalized;
}

export async function addMediaItemFromFile(input: {
  file: File;
  name: string;
  categories: string[];
}): Promise<MediaItem> {
  const kind = mediaKindFromFileName(input.file.name);
  if (!kind) {
    throw new Error("Nepodrzan format fajla.");
  }

  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("name", input.name.trim() || input.file.name);
  formData.append("categories", JSON.stringify(normalizeMediaCategories(input.categories)));

  const response = await fetch("/api/media", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Greska pri upload-u fajla.");
  }
  const payload = (await response.json()) as { item: MediaItem };
  notify();
  return payload.item;
}

export async function deleteMediaItem(id: string) {
  const response = await fetch(`/api/media/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Brisanje fajla nije uspelo.");
  }
  notify();
}

export async function updateMediaItem(input: {
  id: string;
  name: string;
  categories: string[];
}) {
  const response = await fetch(`/api/media/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      categories: normalizeMediaCategories(input.categories),
    }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Ažuriranje media fajla nije uspelo.");
  }
  notify();
}

export async function replaceMediaItemFile(input: {
  id: string;
  file: File;
  name: string;
  categories: string[];
}) {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("name", input.name.trim() || input.file.name);
  formData.append("categories", JSON.stringify(normalizeMediaCategories(input.categories)));
  const response = await fetch(`/api/media/${input.id}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Replace media fajla nije uspeo.");
  }
  notify();
}

export function subscribeMediaLibrary(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const wrapped = () => listener();
  window.addEventListener("bis-media-library-updated", wrapped);
  return () => window.removeEventListener("bis-media-library-updated", wrapped);
}
