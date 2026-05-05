"use client";

import { useRef, useState } from "react";

type SkipEntry = { row: number; reason: string };
type ImportResult = { imported: number; skipped: SkipEntry[] };

export function CatalogCsvImport({ onDone }: { onDone?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/catalog/import", { method: "POST", body: form });
      const data = await res.json() as ImportResult & { error?: string };
      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? "Import failed");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
      if (inputRef.current) inputRef.current.value = "";
      onDone?.();
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
    }
  }

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>CSV import</span>
        <a
          href="/api/catalog/import/template"
          download="catalog-template.xlsx"
          style={{ fontSize: 11, color: "var(--acc)", textDecoration: "none", fontWeight: 600 }}
        >
          ⬇ Skini template (.xlsx)
        </a>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
          style={{ flex: 1, fontSize: 12, color: "var(--ink2)" }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-g"
          style={{ fontSize: 12, padding: "7px 14px", opacity: status === "loading" ? 0.6 : 1 }}
        >
          {status === "loading" ? "Importujem..." : "Import"}
        </button>
      </form>

      <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--ink4)" }}>
        Prihvata <code>.xlsx</code> (preporučeno) i <code>.csv</code>.
        {" "}Obavezno: <code>title *, category *, short_description *, merchant_name *, product_url *, image_url *</code>
        {" · "}Opciono: <code>price_label, quality_tier, is_featured</code>
      </p>

      {status === "error" && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#dc2626" }}>{errorMsg}</p>
      )}

      {status === "done" && result && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            ✓ Importovano: {result.imported} proizvoda
            {result.skipped.length > 0 && `, preskočeno: ${result.skipped.length}`}
          </p>
          {result.skipped.length > 0 && (
            <details style={{ marginTop: 6 }}>
              <summary style={{ fontSize: 11, color: "var(--ink4)", cursor: "pointer" }}>
                Preskočeni redovi ({result.skipped.length})
              </summary>
              <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: 11, color: "var(--ink3)" }}>
                {result.skipped.map((s) => (
                  <li key={s.row}>Red {s.row}: {s.reason}</li>
                ))}
              </ul>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 8, fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--bdr2)", background: "var(--bgw)", cursor: "pointer", color: "var(--ink2)" }}
          >
            Osveži stranicu
          </button>
        </div>
      )}
    </div>
  );
}
