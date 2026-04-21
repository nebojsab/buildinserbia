import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function imagePath() {
  // Monorepo: admin/ is one level below repo root.
  return path.resolve(process.cwd(), "..", "public", "mistakes-static-image.webp");
}

export async function GET() {
  try {
    const bytes = await readFile(imagePath());
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Mistakes image not found." },
      { status: 404 },
    );
  }
}
