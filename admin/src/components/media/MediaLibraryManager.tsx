"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addMediaItemFromFile,
  deleteMediaItem,
  getMediaLibraryItems,
  isSupportedMediaFile,
  subscribeMediaLibrary,
  type MediaItem,
} from "@/lib/mediaLibraryStore";
import { useToast } from "@/components/ui/ToastProvider";
import { formatContentDate } from "@shared/content/helpers";

type MediaHealthPayload = {
  db: { status: "ok" | "fail"; message: string };
  blob: { status: "ok" | "fail"; message: string };
  overall: "ok" | "fail";
};

export function MediaLibraryManager() {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [health, setHealth] = useState<MediaHealthPayload | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const refreshItems = useCallback(async () => {
    try {
      const nextItems = await getMediaLibraryItems();
      setItems(nextItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ne mogu da ucitam media fajlove.");
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    void refreshItems();
    const unsubscribe = subscribeMediaLibrary(() => {
      void refreshItems();
    });
    return () => unsubscribe();
  }, [refreshItems]);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      setHealthLoading(true);
      try {
        const response = await fetch("/api/media/health", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as MediaHealthPayload | null;
        if (!cancelled && payload) setHealth(payload);
      } finally {
        if (!cancelled) setHealthLoading(false);
      }
    }

    void loadHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const isSubmitDisabled = !file || !name.trim() || uploading;

  function normalizeCategory(value: string) {
    return value.trim().replace(/\s+/g, " ");
  }

  function addCategoryChip(next: string) {
    const normalized = normalizeCategory(next);
    if (!normalized) return;
    if (categories.some((entry) => entry.toLowerCase() === normalized.toLowerCase())) return;
    setCategories((prev) => [...prev, normalized]);
  }

  function mergeUniqueCategories(input: string[]) {
    const seen = new Set<string>();
    const merged: string[] = [];

    for (const rawEntry of input) {
      const normalized = normalizeCategory(rawEntry);
      if (!normalized) continue;
      const lower = normalized.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      merged.push(normalized);
    }

    return merged;
  }

  async function onUpload() {
    if (!file || !name.trim()) return;
    setError(null);
    if (!isSupportedMediaFile(file.name)) {
      setError("Podrzani formati su: jpg, png, svg, webp, mp4.");
      return;
    }
    setUploading(true);
    try {
      const pendingCategory = normalizeCategory(categoryInput);
      const uploadCategories = mergeUniqueCategories(
        pendingCategory ? [...categories, pendingCategory] : categories,
      );

      await addMediaItemFromFile({
        file,
        name: name.trim(),
        categories: uploadCategories,
      });
      setName("");
      setFile(null);
      setCategories([]);
      setCategoryInput("");
      toast.success("Media fajl je uspešno dodat.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Greska pri upload-u.");
      toast.error(uploadError instanceof Error ? uploadError.message : "Greška pri upload-u.");
    } finally {
      setUploading(false);
    }
  }

  async function onRestoreImport(file: File) {
    setError(null);
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/restore/media", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; imported?: number; failedCount?: number }
        | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? "Restore import nije uspeo.");
      }
      await refreshItems();
      const imported = payload?.imported ?? 0;
      const failedCount = payload?.failedCount ?? 0;
      toast.success(`Restore završen. Uvezeno: ${imported}. Neuspešno: ${failedCount}.`);
    } catch (restoreError) {
      const message =
        restoreError instanceof Error ? restoreError.message : "Restore import nije uspeo.";
      setError(message);
      toast.error(message);
    } finally {
      setRestoring(false);
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  }

  const sorted = useMemo(
    () => [...items].sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)),
    [items],
  );

  /** Sve jedinstvene kategorije koje su ikad dodate postojećim fajlovima (za autocomplete). */
  const knownCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const item of items) {
      for (const raw of item.categories) {
        const n = normalizeCategory(raw);
        if (!n) continue;
        const lower = n.toLowerCase();
        if (seen.has(lower)) continue;
        seen.add(lower);
        list.push(n);
      }
    }
    list.sort((a, b) => a.localeCompare(b, "sr"));
    return list;
  }, [items]);

  const categorySuggestions = useMemo(() => {
    const selectedLower = new Set(categories.map((c) => c.toLowerCase()));
    const q = categoryInput.trim().toLowerCase();
    return knownCategories.filter((cat) => {
      if (selectedLower.has(cat.toLowerCase())) return false;
      if (!q) return true;
      return cat.toLowerCase().includes(q);
    });
  }, [knownCategories, categories, categoryInput]);

  function pickSuggestedCategory(value: string) {
    addCategoryChip(value);
    setCategoryInput("");
    setCategoryPickerOpen(true);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="card" style={{ padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontFamily: "var(--heading)", fontSize: 18 }}>Media library</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/api/backup/media" className="btn-g">
              Download all media
            </a>
            <button
              type="button"
              className="btn-g"
              disabled={restoring}
              onClick={() => restoreInputRef.current?.click()}
            >
              {restoring ? "Importujem..." : "Restore import"}
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".zip,application/zip"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void onRestoreImport(file);
              }}
            />
            <a href="/api/backup/all" className="btn-g">
              Backup everything
            </a>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.6, marginBottom: 14 }}>
          Upload slika i videa, organizacija po kategorijama, i centralna biblioteka za izbor fajlova u admin formama.
        </p>

        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--bdr)",
            background: "var(--bgw)",
            display: "grid",
            gap: 6,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", letterSpacing: ".03em" }}>
            Health panel
          </p>
          {healthLoading ? (
            <p style={{ fontSize: 12.5, color: "var(--ink4)" }}>Provera statusa...</p>
          ) : (
            <>
              <p style={{ fontSize: 12.5, color: health?.db.status === "ok" ? "var(--grn)" : "#B91C1C" }}>
                DB: {health?.db.status === "ok" ? "OK" : "FAIL"} - {health?.db.message}
              </p>
              <p style={{ fontSize: 12.5, color: health?.blob.status === "ok" ? "var(--grn)" : "#B91C1C" }}>
                Blob: {health?.blob.status === "ok" ? "OK" : "FAIL"} - {health?.blob.message}
              </p>
            </>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="res-2col">
          <div>
            <label className="flabel">Ime fajla</label>
            <input className="finput" value={name} onChange={(event) => setName(event.target.value)} placeholder="Npr. Hero slika za dokument" />
          </div>
          <div>
            <label className="flabel">Upload fajla</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-g"
                onClick={() => uploadInputRef.current?.click()}
              >
                Izaberi fajl
              </button>
              <span style={{ fontSize: 12.5, color: file ? "var(--ink2)" : "var(--ink4)" }}>
                {file ? file.name : "Nije izabran fajl"}
              </span>
              <input
                ref={uploadInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.webp,.mp4"
                style={{ display: "none" }}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <p style={{ fontSize: 11.5, color: "var(--ink4)", marginTop: 6 }}>
              Podrzano: jpg, png, svg, webp, mp4
            </p>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label className="flabel">Kategorije</label>
          <p style={{ fontSize: 11.5, color: "var(--ink4)", marginBottom: 6 }}>
            Izaberite postojeće iz liste ili upišite novu i pritisnite Enter. Više kategorija odjednom.
          </p>
          <div style={{ position: "relative" }}>
            <input
              className="finput"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={categoryPickerOpen}
              value={categoryInput}
              onChange={(event) => {
                setCategoryInput(event.target.value);
                setCategoryPickerOpen(true);
              }}
              onFocus={() => setCategoryPickerOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setCategoryPickerOpen(false), 180);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addCategoryChip(categoryInput);
                setCategoryInput("");
              }}
              placeholder="Pretraži postojeće ili upiši novu kategoriju…"
            />
            {categoryPickerOpen && knownCategories.length > 0 ? (
              <div
                role="listbox"
                aria-label="Predlozi kategorija"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "100%",
                  marginTop: 4,
                  maxHeight: 220,
                  overflowY: "auto",
                  zIndex: 20,
                  borderRadius: 10,
                  border: "1px solid var(--bdr)",
                  background: "var(--card)",
                  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.12)",
                }}
              >
                {categorySuggestions.length === 0 ? (
                  <div style={{ padding: "10px 12px", fontSize: 12.5, color: "var(--ink4)" }}>
                    {categoryInput.trim()
                      ? "Nema poklapanja u postojećim kategorijama — Enter dodaje novu."
                      : "Sve poznate kategorije su već dodate — Enter dodaje novu."}
                  </div>
                ) : (
                  categorySuggestions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        pickSuggestedCategory(opt);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "var(--ink2)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--bdr)",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = "var(--bgw)";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                    >
                      {opt}
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {categories.map((chip) => (
              <span
                key={chip}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 9px",
                  borderRadius: 999,
                  border: "1px solid var(--bdr)",
                  background: "var(--bgw)",
                  color: "var(--ink3)",
                  fontSize: 11.5,
                }}
              >
                {chip}
                <button
                  type="button"
                  onClick={() => setCategories((prev) => prev.filter((entry) => entry !== chip))}
                  style={{ color: "var(--ink4)", fontSize: 11 }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {error ? (
          <p style={{ color: "#DC2626", fontSize: 12.5, marginTop: 10 }}>{error}</p>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn-p" disabled={isSubmitDisabled} onClick={() => void onUpload()}>
            {uploading ? "Uploadujem..." : "Dodaj fajl"}
          </button>
        </div>
      </section>

      <section className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bdr)" }}>
          <h3 style={{ fontFamily: "var(--heading)", fontSize: 17 }}>Svi fajlovi</h3>
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: "22px 18px", color: "var(--ink3)", fontSize: 13 }}>
            {loadingItems ? "Ucitavam media fajlove..." : "Media library je prazna. Dodaj prvi fajl iz forme iznad."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "var(--bgw)" }}>
                  {["Thumb", "Ime", "Tip", "Kategorije", "Datum dodavanja", "Akcije"].map((head) => (
                    <th
                      key={head}
                      style={{
                        textAlign: "left",
                        fontSize: 11,
                        letterSpacing: ".08em",
                        textTransform: "uppercase",
                        color: "var(--ink4)",
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--bdr)",
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <div
                        style={{
                          width: 64,
                          height: 40,
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
                          fontSize: 18,
                        }}
                      >
                        {item.kind === "video" ? "🎬" : ""}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <p style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 600 }}>{item.name}</p>
                      <p style={{ fontSize: 11.5, color: "var(--ink4)", marginTop: 2 }}>{item.fileName}</p>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--ink3)" }}>
                      {item.kind === "image" ? "Slika" : "Video"}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {item.categories.length === 0 ? (
                          <span style={{ fontSize: 11.5, color: "var(--ink4)" }}>Bez kategorije</span>
                        ) : (
                          item.categories.map((chip) => (
                            <span
                              key={`${item.id}-${chip}`}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 999,
                                border: "1px solid var(--bdr)",
                                background: "var(--bgw)",
                                fontSize: 11.5,
                                color: "var(--ink3)",
                              }}
                            >
                              {chip}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", fontSize: 12.5, color: "var(--ink3)" }}>
                      {formatContentDate(item.addedAt)}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="btn-g"
                          style={{ padding: "6px 9px", fontSize: 11.5 }}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(item.url);
                              toast.success("URL je kopiran u clipboard.");
                            } catch {
                              toast.error("Ne mogu da kopiram URL.");
                            }
                          }}
                        >
                          Kopiraj URL
                        </button>
                        <button
                          type="button"
                          className="btn-g"
                          style={{ padding: "6px 9px", fontSize: 11.5, color: "#DC2626", borderColor: "#FCA5A5" }}
                          onClick={async () => {
                            try {
                              await deleteMediaItem(item.id);
                              toast.success("Media fajl je obrisan.");
                            } catch (deleteError) {
                              const message =
                                deleteError instanceof Error ? deleteError.message : "Brisanje nije uspelo.";
                              setError(message);
                              toast.error(message);
                            }
                          }}
                        >
                          Obrisi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
