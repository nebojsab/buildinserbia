import fs from "node:fs";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";
import { unstable_noStore as noStore } from "next/cache";
import type { CatalogProduct } from "@shared/types/catalog";

export type CatalogProductOverride = {
  isActive?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
  lastCheckedAt?: string;
  title?: string;
  merchantName?: string;
  productUrl?: string;
  imageUrl?: string;
  priceLabel?: string;
  updatedAt: string;
};

type CatalogAdminState = {
  productOverrides: Record<string, CatalogProductOverride>;
  customProducts: CatalogProduct[];
};

const STATE_FILE = path.join(process.cwd(), "catalog-admin-state.json");

// Versioned prefix: each write creates catalog-admin-state/{timestamp}.json
// CDN caches per URL — a brand-new URL has never been fetched, so the first
// GET always goes to origin (no stale cache possible).
// list() hits the Blob API directly (not CDN), so it always returns fresh metadata.
const STATE_BLOB_PREFIX = "catalog-admin-state/";

// Legacy single-file path (pre-versioning). Kept for one-time migration reads.
const STATE_BLOB_LEGACY_PATH = "catalog-admin-state.json";

const canUseBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

function parseState(raw: string): CatalogAdminState {
  try {
    const parsed = JSON.parse(raw) as Partial<CatalogAdminState>;
    return {
      productOverrides: parsed.productOverrides ?? {},
      customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : [],
    };
  } catch {
    return { productOverrides: {}, customProducts: [] };
  }
}

function loadFromFile(): CatalogAdminState {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    return parseState(raw);
  } catch {
    return { productOverrides: {}, customProducts: [] };
  }
}

async function loadFromBlob(): Promise<CatalogAdminState> {
  // list() calls the Vercel Blob API (not CDN) — always returns fresh metadata.
  const { blobs } = await list({ prefix: STATE_BLOB_PREFIX });

  if (blobs.length > 0) {
    // Sort descending by upload time; take the most recent version.
    blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    const latest = blobs[0];
    // This URL was never requested before (unique per write) — CDN has no cache
    // entry for it, so the GET goes directly to origin storage. Always fresh.
    const res = await fetch(latest.url, { cache: "no-store" });
    if (res.ok) return parseState(await res.text());
  }

  // Migration: no versioned blobs yet — try the legacy fixed-path blob.
  const legacy = await get(STATE_BLOB_LEGACY_PATH, { access: "public" });
  if (legacy && legacy.statusCode === 200) {
    const stream = legacy.stream as ReadableStream<Uint8Array>;
    return parseState(await new Response(stream).text());
  }

  throw new Error("missing-blob");
}

function persistToFile(state: CatalogAdminState) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // best-effort fallback in local/dev
  }
}

async function saveState(state: CatalogAdminState): Promise<void> {
  if (canUseBlob) {
    // Write to a new unique path each time. This guarantees the next read
    // fetches a URL the CDN has never seen → always fresh origin data.
    const version = Date.now();
    await put(`${STATE_BLOB_PREFIX}${version}.json`, JSON.stringify(state), {
      access: "public",
    });

    // Clean up old versions — keep only the 5 most recent to prevent accumulation.
    try {
      const { blobs } = await list({ prefix: STATE_BLOB_PREFIX });
      blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      const toDelete = blobs.slice(5);
      if (toDelete.length > 0) {
        await del(toDelete.map((b) => b.url));
      }
    } catch {
      // Cleanup failure is non-fatal — stale blobs cost pennies and will be
      // cleaned on the next successful write.
    }
    return;
  }
  persistToFile(state);
}

export async function getCatalogAdminState(): Promise<CatalogAdminState> {
  noStore();
  if (canUseBlob) {
    try {
      return await loadFromBlob();
    } catch {
      // fallback to local file
    }
  }
  return loadFromFile();
}

export async function updateCatalogProductOverride(
  productId: string,
  patch: Partial<Omit<CatalogProductOverride, "updatedAt">>,
): Promise<void> {
  const state = await getCatalogAdminState();
  const current = state.productOverrides[productId] ?? { updatedAt: new Date().toISOString() };
  state.productOverrides[productId] = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveState(state);
}

export async function exportCatalogOverridesJson(): Promise<string> {
  const state = await getCatalogAdminState();
  return JSON.stringify(state, null, 2);
}

export async function clearCatalogProductOverride(productId: string): Promise<void> {
  const state = await getCatalogAdminState();
  if (state.productOverrides[productId]) {
    delete state.productOverrides[productId];
    await saveState(state);
  }
}

export async function bulkAddCustomCatalogProducts(products: CatalogProduct[]): Promise<void> {
  if (products.length === 0) return;
  const state = await getCatalogAdminState();
  const existingIds = new Set(state.customProducts.map((p) => p.id));
  for (const product of products) {
    if (!existingIds.has(product.id)) {
      state.customProducts.unshift(product);
      existingIds.add(product.id);
    }
  }
  await saveState(state);
}

export async function updateCustomCatalogProduct(
  productId: string,
  patch: Partial<Pick<CatalogProduct, "title" | "merchantName" | "productUrl" | "merchantUrl" | "imageUrl" | "priceLabel">>,
): Promise<void> {
  const state = await getCatalogAdminState();
  const idx = state.customProducts.findIndex((p) => p.id === productId);
  if (idx === -1) return;
  state.customProducts[idx] = { ...state.customProducts[idx], ...patch };
  await saveState(state);
}

export async function addCustomCatalogProduct(product: CatalogProduct): Promise<void> {
  const state = await getCatalogAdminState();
  state.customProducts = [product, ...state.customProducts.filter((entry) => entry.id !== product.id)];
  await saveState(state);
}

export async function removeCustomCatalogProduct(productId: string): Promise<void> {
  const state = await getCatalogAdminState();
  const next = state.customProducts.filter((product) => product.id !== productId);
  if (next.length !== state.customProducts.length) {
    state.customProducts = next;
    await saveState(state);
  }
}

export async function bulkRemoveCatalogProducts(
  items: Array<{ id: string; isCustom: boolean }>
): Promise<void> {
  if (items.length === 0) return;
  const state = await getCatalogAdminState();
  const customIds = new Set(items.filter((i) => i.isCustom).map((i) => i.id));
  const baseIds = items.filter((i) => !i.isCustom).map((i) => i.id);
  state.customProducts = state.customProducts.filter((p) => !customIds.has(p.id));
  for (const id of baseIds) {
    const current = state.productOverrides[id] ?? { updatedAt: new Date().toISOString() };
    state.productOverrides[id] = { ...current, isDeleted: true, updatedAt: new Date().toISOString() };
  }
  await saveState(state);
}
