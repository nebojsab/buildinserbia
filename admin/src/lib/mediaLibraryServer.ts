import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { MediaItem, MediaKind } from "@/lib/mediaLibraryStore";

class MediaStoreUnavailableError extends Error {
  constructor() {
    super("MEDIA_STORE_UNAVAILABLE");
  }
}

function shouldUseRawFallback(error: unknown): boolean {
  if (error instanceof MediaStoreUnavailableError) return true;
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return /Environment variable not found:\s*DATABASE_URL/i.test(error.message);
  }
  if (error instanceof Error) {
    return /Environment variable not found:\s*DATABASE_URL/i.test(error.message);
  }
  return false;
}

function isMissingMediaTableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const metaMessage = String((error.meta as { message?: string } | undefined)?.message ?? "");
    return error.code === "P2010" && /no such table:\s*MediaAsset/i.test(metaMessage);
  }
  if (error instanceof Error) {
    return /no such table:\s*MediaAsset/i.test(error.message);
  }
  return false;
}

const fallbackDatabaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
let rawPrismaClient: PrismaClient | null = null;

function rawPrisma(): PrismaClient {
  if (!rawPrismaClient) {
    rawPrismaClient = new PrismaClient({
      datasources: {
        db: {
          url: fallbackDatabaseUrl,
        },
      },
      log: ["error"],
    });
  }
  return rawPrismaClient;
}

async function ensureMediaAssetTable(): Promise<void> {
  await rawPrisma().$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MediaAsset" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "name" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "kind" TEXT NOT NULL,
      "blobPath" TEXT,
      "categories" TEXT NOT NULL DEFAULT '[]',
      "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

type MediaAssetRecord = {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  url: string;
  kind: string;
  addedAt: Date;
  categories: string;
  blobPath?: string | null;
};

function mapRowToRecord(row: {
  id: string;
  name: string;
  fileName: string;
  mimeType: string;
  url: string;
  kind: string;
  addedAt: Date | string;
  categories: string;
  blobPath?: string | null;
}): MediaAssetRecord {
  return {
    id: row.id,
    name: row.name,
    fileName: row.fileName,
    mimeType: row.mimeType,
    url: row.url,
    kind: row.kind,
    addedAt: row.addedAt instanceof Date ? row.addedAt : new Date(row.addedAt),
    categories: row.categories,
    blobPath: row.blobPath ?? null,
  };
}

function generateMediaId(): string {
  return `media-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

async function findManyRaw(): Promise<MediaAssetRecord[]> {
  let rows: Array<{
    id: string;
    name: string;
    fileName: string;
    mimeType: string;
    url: string;
    kind: string;
    addedAt: Date | string;
    categories: string;
    blobPath: string | null;
  }>;
  try {
    rows = await rawPrisma().$queryRaw<
      Array<{
        id: string;
        name: string;
        fileName: string;
        mimeType: string;
        url: string;
        kind: string;
        addedAt: Date | string;
        categories: string;
        blobPath: string | null;
      }>
    >(Prisma.sql`
      SELECT "id", "name", "fileName", "mimeType", "url", "kind", "addedAt", "categories", "blobPath"
      FROM "MediaAsset"
      ORDER BY "addedAt" DESC
    `);
  } catch (error) {
    if (!isMissingMediaTableError(error)) throw error;
    await ensureMediaAssetTable();
    rows = [];
  }
  return rows.map((row) => mapRowToRecord(row));
}

async function findUniqueRaw(id: string): Promise<(MediaAssetRecord & { blobPath: string | null }) | null> {
  let rows: Array<{
    id: string;
    name: string;
    fileName: string;
    mimeType: string;
    url: string;
    kind: string;
    addedAt: Date | string;
    categories: string;
    blobPath: string | null;
  }>;
  try {
    rows = await rawPrisma().$queryRaw<
      Array<{
        id: string;
        name: string;
        fileName: string;
        mimeType: string;
        url: string;
        kind: string;
        addedAt: Date | string;
        categories: string;
        blobPath: string | null;
      }>
    >(Prisma.sql`
      SELECT "id", "name", "fileName", "mimeType", "url", "kind", "addedAt", "categories", "blobPath"
      FROM "MediaAsset"
      WHERE "id" = ${id}
      LIMIT 1
    `);
  } catch (error) {
    if (!isMissingMediaTableError(error)) throw error;
    await ensureMediaAssetTable();
    rows = [];
  }
  const first = rows[0];
  if (!first) return null;
  const record = mapRowToRecord(first);
  return { ...record, blobPath: record.blobPath ?? null };
}

async function createRaw(input: {
  name: string;
  fileName: string;
  mimeType: string;
  url: string;
  kind: MediaKind;
  categories: string[];
  blobPath?: string;
  addedAt?: Date;
}): Promise<MediaAssetRecord> {
  const id = generateMediaId();
  const addedAt = input.addedAt ?? new Date();
  try {
    await rawPrisma().$executeRaw(Prisma.sql`
      INSERT INTO "MediaAsset"
        ("id", "name", "fileName", "mimeType", "url", "kind", "blobPath", "categories", "addedAt", "updatedAt")
      VALUES
        (
          ${id},
          ${input.name},
          ${input.fileName},
          ${input.mimeType},
          ${input.url},
          ${input.kind},
          ${input.blobPath ?? null},
          ${JSON.stringify(input.categories)},
          ${addedAt},
          ${new Date()}
        )
    `);
  } catch (error) {
    if (!isMissingMediaTableError(error)) throw error;
    await ensureMediaAssetTable();
    await rawPrisma().$executeRaw(Prisma.sql`
      INSERT INTO "MediaAsset"
        ("id", "name", "fileName", "mimeType", "url", "kind", "blobPath", "categories", "addedAt", "updatedAt")
      VALUES
        (
          ${id},
          ${input.name},
          ${input.fileName},
          ${input.mimeType},
          ${input.url},
          ${input.kind},
          ${input.blobPath ?? null},
          ${JSON.stringify(input.categories)},
          ${addedAt},
          ${new Date()}
        )
    `);
  }
  const created = await findUniqueRaw(id);
  if (!created) {
    throw new Error("Ne mogu da pronadjem novi media zapis nakon insert-a.");
  }
  return created;
}

async function deleteRaw(id: string): Promise<void> {
  try {
    await rawPrisma().$executeRaw(Prisma.sql`
      DELETE FROM "MediaAsset" WHERE "id" = ${id}
    `);
  } catch (error) {
    if (!isMissingMediaTableError(error)) throw error;
    await ensureMediaAssetTable();
  }
}

function mediaAssetDelegate() {
  const delegate = (prisma as { mediaAsset?: unknown }).mediaAsset;
  if (!delegate) {
    throw new MediaStoreUnavailableError();
  }
  return delegate as {
    findMany: (args: { orderBy: { addedAt: "desc" } }) => Promise<MediaAssetRecord[]>;
    findUnique: (args: { where: { id: string } }) => Promise<(MediaAssetRecord & { blobPath: string | null }) | null>;
    create: (args: {
      data: {
        name: string;
        fileName: string;
        mimeType: string;
        url: string;
        kind: MediaKind;
        blobPath?: string;
        categories: string;
        addedAt?: Date;
      };
    }) => Promise<MediaAssetRecord>;
    delete: (args: { where: { id: string } }) => Promise<void>;
  };
}

function parseCategories(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function toMediaItem(record: MediaAssetRecord): MediaItem {
  return {
    id: record.id,
    name: record.name,
    fileName: record.fileName,
    mimeType: record.mimeType,
    url: record.url,
    kind: record.kind as MediaKind,
    addedAt: record.addedAt.toISOString(),
    categories: parseCategories(record.categories),
  };
}

export async function listMediaItems(): Promise<MediaItem[]> {
  let records: MediaAssetRecord[];
  try {
    records = await mediaAssetDelegate().findMany({
      orderBy: { addedAt: "desc" },
    });
  } catch (error) {
    if (!shouldUseRawFallback(error)) throw error;
    records = await findManyRaw();
  }
  return records.map((record) => toMediaItem(record));
}

export async function getMediaItemById(id: string): Promise<(MediaItem & { blobPath: string | null }) | null> {
  let record: (MediaAssetRecord & { blobPath: string | null }) | null;
  try {
    record = await mediaAssetDelegate().findUnique({
      where: { id },
    });
  } catch (error) {
    if (!shouldUseRawFallback(error)) throw error;
    record = await findUniqueRaw(id);
  }
  if (!record) return null;
  return {
    ...toMediaItem(record),
    blobPath: record.blobPath,
  };
}

export async function createMediaItem(input: {
  name: string;
  fileName: string;
  mimeType: string;
  url: string;
  kind: MediaKind;
  categories: string[];
  blobPath?: string;
  addedAt?: Date;
}): Promise<MediaItem> {
  let record: MediaAssetRecord;
  try {
    record = await mediaAssetDelegate().create({
      data: {
        name: input.name,
        fileName: input.fileName,
        mimeType: input.mimeType,
        url: input.url,
        kind: input.kind,
        blobPath: input.blobPath,
        categories: JSON.stringify(input.categories),
        ...(input.addedAt ? { addedAt: input.addedAt } : {}),
      },
    });
  } catch (error) {
    if (!shouldUseRawFallback(error)) throw error;
    record = await createRaw(input);
  }

  return toMediaItem(record);
}

export async function deleteMediaItemById(id: string): Promise<void> {
  try {
    await mediaAssetDelegate().delete({
      where: { id },
    });
  } catch (error) {
    if (!shouldUseRawFallback(error)) throw error;
    await deleteRaw(id);
  }
}

export function isMediaStoreUnavailableError(error: unknown): error is MediaStoreUnavailableError {
  return error instanceof MediaStoreUnavailableError;
}
