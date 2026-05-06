"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f3f4f6'/%3E%3Ctext x='60' y='44' font-size='10' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

function resolveImageUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return value;
  } catch {}
  return IMAGE_PLACEHOLDER;
}

export type TableProduct = {
  id: string;
  title: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  lastCheckedAt: string;
  staleDays: number;
  imageUrl: string;
  hasOverride: boolean;
  isCustom: boolean;
  merchantName: string;
  productUrl: string;
  priceLabel?: string;
};

type Props = {
  products: TableProduct[];
  toggleActiveAction: (fd: FormData) => Promise<void>;
  toggleFeaturedAction: (fd: FormData) => Promise<void>;
  markCheckedTodayAction: (fd: FormData) => Promise<void>;
  saveInlineMetadataAction: (fd: FormData) => Promise<void>;
  revertOverrideAction: (fd: FormData) => Promise<void>;
  deleteCustomItemAction: (fd: FormData) => Promise<void>;
  removeFromListAction: (fd: FormData) => Promise<void>;
  restoreToListAction: (fd: FormData) => Promise<void>;
};

export function CatalogProductsTable({
  products,
  toggleActiveAction,
  toggleFeaturedAction,
  markCheckedTodayAction,
  saveInlineMetadataAction,
  revertOverrideAction,
  deleteCustomItemAction,
  removeFromListAction,
  restoreToListAction,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < products.length;

  // Set indeterminate state on the select-all checkbox
  if (selectAllRef.current) {
    selectAllRef.current.indeterminate = someSelected;
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  async function doBulkDelete() {
    setBulkLoading(true);
    const items = [...selectedIds].map((id) => ({
      id,
      isCustom: products.find((p) => p.id === id)?.isCustom ?? false,
    }));
    try {
      await fetch("/api/catalog/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      setSelectedIds(new Set());
      router.refresh();
    } finally {
      setBulkLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div style={{
          padding: "10px 14px",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
            {selectedIds.size} {selectedIds.size === 1 ? "stavka izabrana" : "stavki izabrano"}
          </span>
          <button
            type="button"
            className="btn-g"
            style={{ fontSize: 12, padding: "5px 12px", color: "#DC2626", borderColor: "#FCA5A5" }}
            onClick={() => setConfirmOpen(true)}
            disabled={bulkLoading}
          >
            Obriši izabrane
          </button>
          <button
            type="button"
            className="btn-g"
            style={{ fontSize: 12, padding: "5px 12px" }}
            onClick={() => setSelectedIds(new Set())}
          >
            Poništi selekciju
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
            onClick={() => !bulkLoading && setConfirmOpen(false)}
          />
          <div style={{
            position: "relative",
            background: "var(--card)",
            borderRadius: 12,
            padding: 28,
            maxWidth: 420,
            width: "90%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            border: "1px solid var(--bdr)",
          }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "var(--ink)" }}>
              Brisanje {selectedIds.size} {selectedIds.size === 1 ? "stavke" : "stavki"}
            </p>
            <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.6, marginBottom: 22 }}>
              Custom proizvodi biće trajno obrisani. Bazni proizvodi biće uklonjeni sa liste. Ova akcija je nepovratna.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-g"
                style={{ fontSize: 13 }}
                onClick={() => setConfirmOpen(false)}
                disabled={bulkLoading}
              >
                Otkaži
              </button>
              <button
                type="button"
                className="btn-p"
                style={{ fontSize: 13, background: "#DC2626", borderColor: "#DC2626" }}
                onClick={() => void doBulkDelete()}
                disabled={bulkLoading}
              >
                {bulkLoading ? "Brišem..." : `Potvrdi brisanje`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--bgw)", color: "var(--ink3)" }}>
              <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", width: 36 }}>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Izaberi sve"
                />
              </th>
              {["ID", "Slika", "Naslov", "Kategorija", "Featured", "Last checked", "Status", "Override", "Akcije", "Inline edit"].map((head) => (
                <th key={head} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const imageSrc = resolveImageUrl(product.imageUrl);
              return (
                <tr key={product.id} style={{ background: selectedIds.has(product.id) ? "var(--accbg)" : undefined }}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleRow(product.id)}
                      aria-label={`Izaberi ${product.title}`}
                    />
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{product.id}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    <img
                      src={imageSrc}
                      alt={product.title}
                      width={54}
                      height={36}
                      referrerPolicy="no-referrer"
                      style={{ objectFit: "cover", borderRadius: 6, border: "1px solid var(--bdr)" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = IMAGE_PLACEHOLDER; }}
                    />
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{product.title}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{product.category}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    {product.isFeatured ? "Yes" : "No"}
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    {product.lastCheckedAt} ({product.staleDays}d)
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 999, fontSize: 11,
                      background: product.isDeleted ? "#FEE2E2" : product.staleDays > 45 ? "#FEF3C7" : "#DCFCE7",
                      color: product.isDeleted ? "#991B1B" : product.staleDays > 45 ? "#92400E" : "#166534",
                      border: `1px solid ${product.isDeleted ? "#FCA5A5" : product.staleDays > 45 ? "#FCD34D" : "#86EFAC"}`,
                    }}>
                      {product.isDeleted ? "removed" : product.staleDays > 45 ? "stale" : "fresh"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 999, fontSize: 11,
                      background: product.hasOverride || product.isCustom ? "#DBEAFE" : "#F3F4F6",
                      color: product.hasOverride || product.isCustom ? "#134279" : "#6B7280",
                      border: `1px solid ${product.hasOverride || product.isCustom ? "#93C5FD" : "#E5E7EB"}`,
                    }}>
                      {product.isCustom ? "custom item" : product.hasOverride ? "override" : "base"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <form action={toggleActiveAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="current" value={String(product.isActive)} />
                        <button type="submit" className="btn-g" style={{ padding: "4px 8px", fontSize: 11 }}>
                          {product.isActive ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={toggleFeaturedAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="current" value={String(product.isFeatured)} />
                        <button type="submit" className="btn-g" style={{ padding: "4px 8px", fontSize: 11 }}>
                          {product.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                      </form>
                      <form action={markCheckedTodayAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <button type="submit" className="btn-g" style={{ padding: "4px 8px", fontSize: 11 }}>
                          Mark checked
                        </button>
                      </form>
                      {product.isDeleted ? (
                        <form action={restoreToListAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <button type="submit" className="btn-g" style={{ padding: "4px 8px", fontSize: 11 }}>
                            Vrati na listu
                          </button>
                        </form>
                      ) : (
                        <form action={removeFromListAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="isCustom" value={String(product.isCustom)} />
                          <button
                            type="submit"
                            className="btn-g"
                            style={{ padding: "4px 8px", fontSize: 11 }}
                            onClick={(e) => { if (!window.confirm("Da li ste sigurni da zelite da uklonite ovaj item sa liste?")) e.preventDefault(); }}
                          >
                            Obrisi sa liste
                          </button>
                        </form>
                      )}
                      {product.isCustom && !product.isDeleted ? (
                        <form action={deleteCustomItemAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <button
                            type="submit"
                            className="btn-g"
                            style={{ padding: "4px 8px", fontSize: 11 }}
                            onClick={(e) => { if (!window.confirm("Da li ste sigurni da zelite trajno da obrisete custom item?")) e.preventDefault(); }}
                          >
                            Delete custom
                          </button>
                        </form>
                      ) : product.hasOverride ? (
                        <form action={revertOverrideAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <button
                            type="submit"
                            className="btn-g"
                            style={{ padding: "4px 8px", fontSize: 11 }}
                            onClick={(e) => { if (!window.confirm("Da li ste sigurni da zelite da revertujete override za ovaj item?")) e.preventDefault(); }}
                          >
                            Revert override
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", minWidth: 320 }}>
                    <form action={saveInlineMetadataAction} style={{ display: "grid", gap: 6 }}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="isCustom" value={String(product.isCustom)} />
                      <input type="text" name="title" defaultValue={product.title} className="finput" style={{ padding: "6px 8px", fontSize: 11 }} placeholder="Naziv" />
                      <input type="text" name="merchantName" defaultValue={product.merchantName} className="finput" style={{ padding: "6px 8px", fontSize: 11 }} placeholder="Merchant name" />
                      <input type="text" name="priceLabel" defaultValue={product.priceLabel ?? ""} className="finput" style={{ padding: "6px 8px", fontSize: 11 }} placeholder="Price label" />
                      <input type="url" name="productUrl" defaultValue={product.productUrl} className="finput" style={{ padding: "6px 8px", fontSize: 11 }} placeholder="Product URL" />
                      <input type="url" name="imageUrl" defaultValue={product.imageUrl} className="finput" style={{ padding: "6px 8px", fontSize: 11 }} placeholder="Image URL" />
                      <button type="submit" className="btn-p" style={{ padding: "6px 10px", fontSize: 11 }}>Sačuvaj</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
