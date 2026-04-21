import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  deleteMediaItemById,
  getMediaItemById,
  isMediaStoreUnavailableError,
} from "@/lib/mediaLibraryServer";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const existing = await getMediaItemById(id);
    if (!existing) {
      return NextResponse.json({ error: "Media fajl nije pronadjen." }, { status: 404 });
    }

    await deleteMediaItemById(id);

    if (existing.blobPath) {
      await del(existing.blobPath);
    } else {
      await del(existing.url);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/media/${id} failed`, error);
    if (isMediaStoreUnavailableError(error)) {
      return NextResponse.json(
        { error: "Media model nije ucitan. Restartuj admin server pa pokusaj ponovo." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Brisanje media fajla nije uspelo." }, { status: 500 });
  }
}
