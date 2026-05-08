import fs from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
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
const STATE_BLOB_PATH = "catalog-admin-state.json";
// Private blobs bypass Vercel CDN entirely (useCache: false fetches from origin).
// Public blobs are cached at edge for up to 365 days, causing stale reads in
// read-modify-write cycles even with cache-busting query params.
const STATE_BLOB_ACCESS = "private" as const;
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
  // Private blob + useCache:false → fetches from origin storage, never CDN.
  // This is the only reliable way to avoid stale reads in read-modify-write cycles.
  const result = await get(STATE_BLOB_PATH, { access: STATE_BLOB_ACCESS, useCache: false });
  if (result && result.statusCode === 200) {
    const stream = result.stream as ReadableStream<Uint8Array>;
    return parseState(await new Response(stream).text());
  }

  // Migration path: private blob doesn't exist yet (first run after switching from
  // public access). Read the legacy public blob using ONLY result.stream — the
  // authenticated get() call routes through Vercel's internal network which
  // bypasses the public CDN cache, giving us origin-fresh data.
  // We deliberately do NOT re-fetch the CDN blobUrl here.
  // Note: useCache: false causes 400 for public blobs — omit it.
  const legacy = await get(STATE_BLOB_PATH, { access: "public" });
  if (!legacy || legacy.statusCode !== 200) throw new Error("missing-blob");
  const stream = legacy.stream as ReadableStream<Uint8Array>;
  return parseState(await new Response(stream).text());
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
    await put(STATE_BLOB_PATH, JSON.stringify(state), {
      access: STATE_BLOB_ACCESS,
      allowOverwrite: true,
    });
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
