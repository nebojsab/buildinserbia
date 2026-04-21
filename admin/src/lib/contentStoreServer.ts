import { getAllContentByType } from "@shared/content/repository";
import type { BaseContentItem, ContentType } from "@shared/content/types";
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

export async function getServerContentByType(typeInput: string): Promise<BaseContentItem[]> {
  assertType(typeInput);
  const type = typeInput;
  await ensureContentTable();

  const rows = await prisma.$queryRawUnsafe<ContentRow[]>(
    `SELECT payload FROM ContentRecord WHERE contentType = ? ORDER BY updatedAt DESC`,
    type,
  );
  const parsed = parseRows(rows, type);
  if (parsed.length > 0) return parsed;
  return getAllContentByType(type);
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
  const sanitized = items.filter((item) => item.type === type);
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
}
