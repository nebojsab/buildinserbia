"use client";

import { useEffect, useState } from "react";
import type { DocEntry } from "@/lib/documentLibraryState";

export function DocumentLibraryPanel({
  documents,
  categories,
  saved,
  uploadAction,
  deleteAction,
}: {
  documents: DocEntry[];
  categories: string[];
  saved: boolean;
  uploadAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}) {
  const [toastText, setToastText] = useState<string | null>(null);
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (saved) {
      setToastText("Sačuvano!");
      const t = setTimeout(() => setToastText(null), 3000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function fileIcon(fileType: string): string {
    const t = fileType.toLowerCase();
    if (t.includes("pdf")) return "📄";
    if (t.includes("word") || t.includes("doc")) return "📝";
    if (t.includes("sheet") || t.includes("xls") || t.includes("csv")) return "📊";
    if (t.includes("zip") || t.includes("rar")) return "🗜️";
    if (t.includes("image") || t.includes("png") || t.includes("jpg")) return "🖼️";
    return "📎";
  }

  return (
    <>
      {toastText && <div className="toast-success">{toastText}</div>}

      {/* Upload form */}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 24 }}>
        <h3
          style={{
            fontFamily: "var(--heading)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink)",
            marginBottom: 18,
          }}
        >
          Dodaj novi dokument
        </h3>
        <form
          action={uploadAction}
          encType="multipart/form-data"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="flabel" htmlFor="dl-title">
                Naziv dokumenta *
              </label>
              <input
                id="dl-title"
                name="title"
                required
                className="finput"
                placeholder="npr. Pravilnik o gradnji 2024"
              />
            </div>
            <div>
              <label className="flabel">Kategorija *</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!useNewCategory ? (
                  <select name="category" className="fselect" style={{ flex: 1 }}>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="categoryNew"
                    required
                    className="finput"
                    style={{ flex: 1 }}
                    placeholder="Nova kategorija..."
                  />
                )}
                <button
                  type="button"
                  className="btn-g"
                  style={{ flexShrink: 0, fontSize: 12, padding: "8px 12px" }}
                  onClick={() => setUseNewCategory((v) => !v)}
                >
                  {useNewCategory ? "← Postojeća" : "+ Nova"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="flabel" htmlFor="dl-desc">
              Opis (opciono)
            </label>
            <input
              id="dl-desc"
              name="description"
              className="finput"
              placeholder="Kratki opis dokumenta..."
            />
          </div>

          <div>
            <label className="flabel" htmlFor="dl-file">
              Fajl *
            </label>
            <input
              id="dl-file"
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar,.png,.jpg,.jpeg"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid var(--bdr)",
                borderRadius: "var(--r)",
                background: "var(--bg)",
                fontFamily: "var(--sans)",
                fontSize: 13,
                color: "var(--ink)",
              }}
            />
            <p
              style={{
                fontSize: 11,
                color: "var(--ink4)",
                marginTop: 5,
                fontFamily: "var(--sans)",
              }}
            >
              PDF, DOC, DOCX, XLS, XLSX, CSV, ZIP, PNG, JPG — max 50 MB
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-p" style={{ fontSize: 13, padding: "10px 22px" }}>
              Otpremi dokument
            </button>
          </div>
        </form>
      </div>

      {/* Documents table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--bdr)",
            background: "var(--bgw)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--heading)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink2)",
              margin: 0,
            }}
          >
            Dokumenti ({documents.length})
          </h3>
        </div>

        {documents.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--ink4)",
              fontSize: 13,
              fontFamily: "var(--sans)",
            }}
          >
            Nema otpremljenih dokumenata. Koristite formu iznad da dodate prvi dokument.
          </div>
        ) : (
          <div>
            {documents.map((doc, i) => (
              <div
                key={doc.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr auto auto auto",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < documents.length - 1 ? "1px solid var(--bdr)" : "none",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{fileIcon(doc.fileType)}</span>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--ink)",
                      fontFamily: "var(--sans)",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title}
                  </p>
                  <p
                    style={{ fontSize: 11.5, color: "var(--ink4)", fontFamily: "var(--sans)" }}
                  >
                    {doc.fileName} · {formatSize(doc.fileSize)}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: "var(--accbg)",
                    color: "var(--acc)",
                    border: "1px solid var(--accmid)",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--sans)",
                  }}
                >
                  {doc.category}
                </span>

                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink4)",
                    fontFamily: "var(--sans)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(doc.uploadedAt)}
                </span>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-g"
                    style={{ fontSize: 11.5, padding: "5px 10px" }}
                  >
                    Pregled
                  </a>
                  {deleteId === doc.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={doc.id} />
                        <button
                          type="submit"
                          style={{
                            fontSize: 11.5,
                            padding: "5px 10px",
                            borderRadius: "var(--r)",
                            border: "1.5px solid #DC2626",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            cursor: "pointer",
                            fontFamily: "var(--sans)",
                          }}
                        >
                          Potvrdi
                        </button>
                      </form>
                      <button
                        type="button"
                        className="btn-g"
                        style={{ fontSize: 11.5, padding: "5px 10px" }}
                        onClick={() => setDeleteId(null)}
                      >
                        Odustani
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      style={{
                        fontSize: 11.5,
                        padding: "5px 10px",
                        borderRadius: "var(--r)",
                        border: "1.5px solid var(--bdr2)",
                        background: "none",
                        color: "var(--ink4)",
                        cursor: "pointer",
                        fontFamily: "var(--sans)",
                      }}
                      onClick={() => setDeleteId(doc.id)}
                    >
                      Obriši
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
