import { getAllContentByType } from "@shared/content/repository";
import type { BaseContentItem, ContentType } from "@shared/content/types";
import { list, put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type ContentRow = {
  payload: string;
};

function assertType(type: string): asserts type is ContentType {
  if (type !== "document" && type !== "blog") {
    throw new Error("Unsupported content type.");
  }
}

async function ensureContentTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ContentRecord (
      id TEXT PRIMARY KEY,
      contentType TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_content_record_type ON ContentRecord(contentType)`,
  );
}

function parseRows(rows: ContentRow[], type: ContentType): BaseContentItem[] {
  const parsed: BaseContentItem[] = [];
  for (const row of rows) {
    try {
      const item = JSON.parse(row.payload) as BaseContentItem;
      if (!item || item.type !== type || !item.id || !item.slug) continue;
      parsed.push(item);
    } catch {
      // Ignore malformed rows.
    }
  }
  return parsed;
}

function shouldFallbackToSeed(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return /Unable to open the database file|Environment variable not found:\s*DATABASE_URL/i.test(
      error.message,
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const metaMessage = String((error.meta as { message?: string } | undefined)?.message ?? "");
    return error.code === "P2010" && /no such table:\s*ContentRecord/i.test(metaMessage);
  }
  if (error instanceof Error) {
    return /Unable to open the database file|Environment variable not found:\s*DATABASE_URL|no such table:\s*ContentRecord/i.test(
      error.message,
    );
  }
  return false;
}

function blobIndexPathForType(type: ContentType): string {
  return `content/content-index-${type}.json`;
}

function blobIndexPrefixForType(type: ContentType): string {
  return `content/content-index-${type}`;
}

function sanitizeItemsByType(type: ContentType, items: BaseContentItem[]): BaseContentItem[] {
  return items.filter((item) => item.type === type);
}

async function readBlobContentByType(type: ContentType): Promise<BaseContentItem[]> {
  const { blobs } = await list({
    prefix: blobIndexPrefixForType(type),
    limit: 20,
  });
  if (!Array.isArray(blobs) || blobs.length === 0) return [];
  const latest = [...blobs].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
  const response = await fetch(latest.url, { cache: "no-store" });
  if (!response.ok) return [];
  const parsed = (await response.json()) as unknown;
  if (!Array.isArray(parsed)) return [];
  return sanitizeItemsByType(type, parsed as BaseContentItem[]);
}

async function writeBlobContentByType(type: ContentType, items: BaseContentItem[]): Promise<void> {
  await put(blobIndexPathForType(type), JSON.stringify(sanitizeItemsByType(type, items)), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
}

export async function getServerContentByType(typeInput: string): Promise<BaseContentItem[]> {
  assertType(typeInput);
  const type = typeInput;
  try {
    await ensureContentTable();

    const rows = await prisma.$queryRawUnsafe<ContentRow[]>(
      `SELECT payload FROM ContentRecord WHERE contentType = ? ORDER BY updatedAt DESC`,
      type,
    );
    const parsed = parseRows(rows, type);
    if (parsed.length > 0) return parsed;
    return getAllContentByType(type);
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      try {
        const blobItems = await readBlobContentByType(type);
        if (blobItems.length > 0) return blobItems;
      } catch {
        // Ignore Blob lookup failures and keep seed fallback.
      }
      return getAllContentByType(type);
    }
    throw error;
  }
}

export async function getServerPublishedContentByType(typeInput: string): Promise<BaseContentItem[]> {
  const all = await getServerContentByType(typeInput);
  return all.filter((item) => item.publishStatus === "published");
}

export async function saveServerContentByType(
  typeInput: string,
  items: BaseContentItem[],
): Promise<void> {
  assertType(typeInput);
  const type = typeInput;
  const sanitized = sanitizeItemsByType(type, items);
  try {
    await ensureContentTable();
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM ContentRecord WHERE contentType = ?`, type);
      const nowIso = new Date().toISOString();
      for (const item of sanitized) {
        await tx.$executeRawUnsafe(
          `INSERT INTO ContentRecord (id, contentType, payload, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
          item.id,
          type,
          JSON.stringify(item),
          item.createdAt || nowIso,
          nowIso,
        );
      }
    });
  } catch (error) {
    if (!shouldFallbackToSeed(error)) throw error;
    await writeBlobContentByType(type, sanitized);
  }
}
