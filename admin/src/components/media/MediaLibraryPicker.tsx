"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getMediaLibraryItems,
  subscribeMediaLibrary,
  type MediaItem,
  type MediaKind,
} from "@/lib/mediaLibraryStore";

export function MediaLibraryPicker({
  label = "Izaberi iz Media Library",
  kind = "image",
  onSelect,
}: {
  label?: string;
  kind?: MediaKind;
  onSelect: (item: MediaItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function refreshItems() {
      try {
        const next = await getMediaLibraryItems();
        if (!cancelled) setItems(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void refreshItems();
    const unsubscribe = subscribeMediaLibrary(() => {
      void refreshItems();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const filtered = useMemo(() => items.filter((item) => item.kind === kind), [items, kind]);
  const selected = useMemo(
    () => filtered.find((item) => item.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  return (
    <>
      <button type="button" className="btn-g" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open ? (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 760, padding: "16px 16px" }}
            onClick={(event) => event.stopPropagation()}
          >
            <h4 style={{ fontFamily: "var(--heading)", fontSize: 20, marginBottom: 10 }}>
              Media Library
            </h4>
            {loading ? (
              <p style={{ fontSize: 13.5, color: "var(--ink3)" }}>Ucitavam fajlove...</p>
            ) : filtered.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--ink3)" }}>
                Nema dostupnih {kind === "image" ? "slika" : "video"} fajlova.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
                  gap: 10,
                  maxHeight: 390,
                  overflow: "auto",
                  paddingRight: 4,
                }}
              >
                {filtered.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      border: selectedId === item.id ? "2px solid var(--acc)" : "1px solid var(--bdr)",
                      borderRadius: 10,
                      background: "var(--card)",
                      padding: 8,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 10",
                        borderRadius: 8,
                        border: "1px solid var(--bdr)",
                        background:
                          item.kind === "image"
                            ? `center / cover no-repeat url(${item.url})`
                            : "linear-gradient(145deg, rgba(24,24,27,.04), rgba(24,24,27,.12))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--ink3)",
                        fontSize: 26,
                      }}
                    >
                      {item.kind === "video" ? "🎬" : ""}
                    </div>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink2)",
                        marginTop: 8,
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.name}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button type="button" className="btn-g" onClick={() => setOpen(false)}>
                Otkazi
              </button>
              <button
                type="button"
                className="btn-p"
                disabled={!selected}
                onClick={() => {
                  if (!selected) return;
                  onSelect(selected);
                  setOpen(false);
                }}
              >
                Izaberi fajl
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
