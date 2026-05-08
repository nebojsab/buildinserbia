"use client";

import { useState } from "react";

type Status = "idle" | "checking" | "migrating" | "done" | "error";

export function BlobMigrateButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleCheck() {
    setStatus("checking");
    setMessage("");
    try {
      const res = await fetch("/api/blob-migrate");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        setStatus("error");
        setMessage(err.error ?? "Greška pri čitanju bloba.");
        return;
      }
      const text = await res.text();
      let parsed: { customProducts?: unknown[]; productOverrides?: Record<string, unknown> };
      try {
        parsed = JSON.parse(text);
      } catch {
        setStatus("error");
        setMessage("Blob ne sadrži validan JSON.");
        return;
      }
      const customCount = Array.isArray(parsed.customProducts) ? parsed.customProducts.length : 0;
      const overrideCount = Object.keys(parsed.productOverrides ?? {}).length;
      setStatus("idle");
      setMessage(`✓ Public blob: ${customCount} custom proizvoda, ${overrideCount} override-a. Klikni "Migracija" da prebaciš u private blob.`);
    } catch {
      setStatus("error");
      setMessage("Mrežna greška.");
    }
  }

  async function handleMigrate() {
    setStatus("migrating");
    setMessage("");
    try {
      const res = await fetch("/api/blob-migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Migracija nije uspela.");
        return;
      }
      setStatus("done");
      setMessage("✓ Migracija uspešna! Podaci su sačuvani u private blobu. Refresh stranice da vidiš sve proizvode.");
    } catch {
      setStatus("error");
      setMessage("Mrežna greška.");
    }
  }

  const isLoading = status === "checking" || status === "migrating";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      background: status === "done" ? "var(--grnbg)" : status === "error" ? "#FEF2F2" : "#FFFBEB",
      border: `1px solid ${status === "done" ? "var(--grnmid)" : status === "error" ? "#FCA5A5" : "#FCD34D"}`,
      borderRadius: 10,
      flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: status === "done" ? "var(--grn)" : status === "error" ? "#B91C1C" : "#92400E", flex: 1, minWidth: 200 }}>
        {status === "done"
          ? message
          : status === "error"
            ? `⚠ ${message}`
            : message || "🔄 Blob migracija: public → private (ako nedostaju proizvodi, pokreni ovo)"}
      </span>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleCheck}
          disabled={isLoading || status === "done"}
          className="btn-g"
          style={{ fontSize: 11, padding: "6px 10px", opacity: isLoading || status === "done" ? 0.5 : 1 }}
        >
          {status === "checking" ? "Proverava..." : "Proveri blob"}
        </button>
        <button
          onClick={handleMigrate}
          disabled={isLoading || status === "done"}
          className="btn-p"
          style={{ fontSize: 11, padding: "6px 10px", opacity: isLoading || status === "done" ? 0.5 : 1 }}
        >
          {status === "migrating" ? "Migrira..." : "Migracija →"}
        </button>
      </div>
    </div>
  );
}
