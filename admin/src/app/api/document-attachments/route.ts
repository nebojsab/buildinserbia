import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

function safeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

function extensionFromName(name: string): "pdf" | "docx" | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf" || ext === "docx") return ext;
  return null;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isBlobTokenMissing(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /BLOB_READ_WRITE_TOKEN|No token found|token/i.test(error.message);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (files.length === 0) {
      return NextResponse.json({ error: "Nedostaju fajlovi za upload." }, { status: 400 });
    }

    const attachments = [];

    for (const entry of files) {
      if (!(entry instanceof File)) {
        return NextResponse.json({ error: "Neispravan format upload fajla." }, { status: 400 });
      }

      const fileType = extensionFromName(entry.name);
      if (!fileType) {
        return NextResponse.json(
          { error: "Only PDF and DOCX files are supported." },
          { status: 400 },
        );
      }

      const blob = await put(
        `document-attachments/${Date.now()}-${safeFileName(entry.name)}`,
        entry,
        {
          access: "public",
          addRandomSuffix: true,
        },
      );

      attachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: entry.name,
        fileUrl: blob.url,
        fileType,
        fileSize: formatBytes(entry.size),
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ attachments }, { status: 201 });
  } catch (error) {
    console.error("POST /api/document-attachments failed", error);
    if (isBlobTokenMissing(error)) {
      return NextResponse.json(
        {
          error:
            "Nedostaje BLOB_READ_WRITE_TOKEN. Dodaj ga u admin/.env.local i restartuj admin server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Upload attachment fajlova nije uspeo." },
      { status: 500 },
    );
  }
}
