import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { get, put } from "@vercel/blob";

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

type DocumentLibraryState = {
  documents: DocEntry[];
  categories: string[];
};

const STATE_FILE = path.join(process.cwd(), "documents-state.json");
const STATE_BLOB_PATH = "documents-state.json";
const canUseBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

const DEFAULT_CATEGORIES = [
  "Opšti dokumenti",
  "Dozvole i regulativa",
  "Ugovori",
  "Tehnička dokumentacija",
];

function parseState(raw: string): DocumentLibraryState {
  const parsed = JSON.parse(raw) as Partial<DocumentLibraryState>;
  return {
    documents: parsed.documents ?? [],
    categories: parsed.categories ?? [...DEFAULT_CATEGORIES],
  };
}

function loadFromFile(): DocumentLibraryState {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    return parseState(raw);
  } catch {
    return { documents: [], categories: [...DEFAULT_CATEGORIES] };
  }
}

async function loadFromBlob(): Promise<DocumentLibraryState> {
  const result = await get(STATE_BLOB_PATH, { access: "public" });
  if (!result || result.statusCode !== 200) throw new Error("missing-blob");
  const stream = result.stream as ReadableStream<Uint8Array>;
  const text = await new Response(stream).text();
  return parseState(text);
}

function persistToFile(state: DocumentLibraryState) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // best-effort
  }
}

export async function getDocumentLibraryState(): Promise<DocumentLibraryState> {
  if (canUseBlob) {
    try {
      return await loadFromBlob();
    } catch {
      // fallback to disk
    }
  }
  return loadFromFile();
}

async function saveState(state: DocumentLibraryState): Promise<void> {
  if (canUseBlob) {
    await put(STATE_BLOB_PATH, JSON.stringify(state), {
      access: "public",
      allowOverwrite: true,
    });
    return;
  }
  persistToFile(state);
}

export async function addDocument(
  doc: Omit<DocEntry, "id" | "uploadedAt">
): Promise<DocEntry> {
  const state = await getDocumentLibraryState();
  const newDoc: DocEntry = {
    ...doc,
    id: randomUUID(),
    uploadedAt: new Date().toISOString(),
  };
  // Auto-register unknown categories
  if (!state.categories.includes(doc.category)) {
    state.categories.push(doc.category);
  }
  state.documents.unshift(newDoc);
  await saveState(state);
  return newDoc;
}

export async function deleteDocument(id: string): Promise<void> {
  const state = await getDocumentLibraryState();
  state.documents = state.documents.filter((d) => d.id !== id);
  await saveState(state);
}

export async function addCategory(name: string): Promise<void> {
  const state = await getDocumentLibraryState();
  if (!state.categories.includes(name)) {
    state.categories.push(name);
    await saveState(state);
  }
}

export async function deleteCategory(name: string): Promise<void> {
  const state = await getDocumentLibraryState();
  state.categories = state.categories.filter((c) => c !== name);
  await saveState(state);
}
