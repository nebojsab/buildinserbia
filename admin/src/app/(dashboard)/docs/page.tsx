import { requireAuth } from "@/lib/auth";
import type { Metadata } from "next";
import type { SearchParams } from "next/dist/server/request/search-params";
import { redirect } from "next/navigation";
import path from "node:path";
import fs from "node:fs";
import { put } from "@vercel/blob";
import { getDocumentLibraryState, addDocument, deleteDocument } from "@/lib/documentLibraryState";
import { DocumentLibraryPanel } from "./DocumentLibraryPanel";

async function handleUpload(formData: FormData) {
  "use server";
  await requireAuth();

  const title = formData.get("title")?.toString().trim() || "";
  if (!title) redirect("/docs");

  const categoryExisting = formData.get("category")?.toString().trim() || "";
  const categoryNew = formData.get("categoryNew")?.toString().trim() || "";
  const category = categoryNew || categoryExisting || "Opšti dokumenti";
  const descRaw = formData.get("description")?.toString().trim() || "";
  const description = descRaw || null;

  type FileLike = { arrayBuffer: () => Promise<ArrayBuffer>; size: number; name?: string; type?: string };
  const fileEntry = formData.get("file");
  if (!fileEntry || typeof fileEntry === "string") redirect("/docs");

  const fileLike = fileEntry as unknown as FileLike;
  if (typeof fileLike.arrayBuffer !== "function" || !fileLike.size) redirect("/docs");

  const bytes = await (fileLike as FileLike).arrayBuffer();
  const fileName = (fileLike as FileLike).name || "document";
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const fileType = (fileLike as FileLike).type || ext;
  const fileSize = (fileLike as FileLike).size;

  const canUseBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
  let fileUrl: string;

  if (canUseBlob) {
    const blobPath = `docs/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
    const blob = await put(blobPath, bytes, { access: "public" });
    fileUrl = blob.url;
  } else {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "docs");
    fs.mkdirSync(uploadsDir, { recursive: true });
    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    fs.writeFileSync(path.join(uploadsDir, uniqueName), Buffer.from(bytes));
    fileUrl = `/uploads/docs/${uniqueName}`;
  }

  await addDocument({ title, description, category, fileUrl, fileName, fileSize, fileType });
  redirect("/docs?saved=1");
}

async function handleDelete(formData: FormData) {
  "use server";
  await requireAuth();
  const id = formData.get("id")?.toString() || "";
  if (id) await deleteDocument(id);
  redirect("/docs?saved=1");
}

export const metadata: Metadata = {
  title: "BuildInSerbia · Document Library",
};

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  const state = await getDocumentLibraryState();
  const sp = await searchParams;
  const saved = sp?.saved === "1";

  return (
    <div style={{ maxWidth: 900 }}>
      <h2
        style={{
          fontFamily: "var(--heading)",
          fontSize: 20,
          fontWeight: 500,
          color: "var(--ink)",
          marginBottom: 6,
        }}
      >
        Document Library
      </h2>
      <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 22, fontFamily: "var(--sans)" }}>
        Otpremite i upravljajte dokumentima koji će biti dostupni na javnom sajtu. Posetioci mogu
        pretraživati i preuzimati dokumente po kategorijama.
      </p>

      <DocumentLibraryPanel
        documents={state.documents}
        categories={state.categories}
        saved={saved}
        uploadAction={handleUpload}
        deleteAction={handleDelete}
      />
    </div>
  );
}
