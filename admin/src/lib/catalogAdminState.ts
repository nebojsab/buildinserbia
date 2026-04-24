import fs from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
import type { CatalogProduct } from "@shared/types/catalog";

export type CatalogProductOverride = {
  isActive?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
  lastCheckedAt?: string;
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
  const result = await get(STATE_BLOB_PATH, { access: STATE_BLOB_ACCESS });
  if (!result || result.statusCode !== 200) throw new Error("missing-blob");
  const stream = result.stream as ReadableStream<Uint8Array>;
  const text = await new Response(stream).text();
  return parseState(text);
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
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
      contentType: "application/json; charset=utf-8",
    });
    return;
  }
  persistToFile(state);
}

export async function getCatalogAdminState(): Promise<CatalogAdminState> {
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
