import { categories } from "@shared/data/catalog/categories";
import { plannerMappings } from "@shared/data/catalog/plannerMappings";
import { products } from "@shared/data/catalog/products";
import type { CatalogCategoryId, CatalogProduct } from "@shared/types/catalog";
import { revalidatePath } from "next/cache";
import {
  addCustomCatalogProduct,
  clearCatalogProductOverride,
  getCatalogAdminState,
  removeCustomCatalogProduct,
  updateCatalogProductOverride,
  updateCustomCatalogProduct,
} from "@/lib/catalogAdminState";
import { mirrorImageToBlob } from "@/lib/mirrorImageToBlob";
import { CatalogProductsTable, type TableProduct } from "@/components/catalog/CatalogProductsTable";
import { CatalogCsvImport } from "@/components/catalog/CatalogCsvImport";

function daysSince(dateIso: string): number {
  const now = Date.now();
  const then = new Date(dateIso).getTime();
  if (!Number.isFinite(then)) return 999;
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function toggleActiveAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const current = String(formData.get("current") ?? "false") === "true";
  if (!productId) return;
  await updateCatalogProductOverride(productId, { isActive: !current });
  revalidatePath("/admin/catalog");
}

async function toggleFeaturedAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const current = String(formData.get("current") ?? "false") === "true";
  if (!productId) return;
  await updateCatalogProductOverride(productId, { isFeatured: !current });
  revalidatePath("/admin/catalog");
}

async function markCheckedTodayAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  await updateCatalogProductOverride(productId, { lastCheckedAt: new Date().toISOString().slice(0, 10) });
  revalidatePath("/admin/catalog");
}

async function saveInlineMetadataAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const isCustom = formData.get("isCustom") === "true";
  const titleRaw = String(formData.get("title") ?? "").trim();
  const merchantNameRaw = String(formData.get("merchantName") ?? "").trim();
  const productUrlRaw = String(formData.get("productUrl") ?? "").trim();
  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const priceLabelRaw = String(formData.get("priceLabel") ?? "").trim();
  const productUrl = productUrlRaw && isValidHttpUrl(productUrlRaw) ? productUrlRaw : undefined;
  let imageUrl = imageUrlRaw && isValidHttpUrl(imageUrlRaw) ? imageUrlRaw : undefined;

  if (imageUrl) {
    try { imageUrl = await mirrorImageToBlob(imageUrl, productId); } catch { /* keep original url */ }
  }

  if (isCustom) {
    await updateCustomCatalogProduct(productId, {
      ...(titleRaw ? { title: titleRaw } : {}),
      ...(merchantNameRaw ? { merchantName: merchantNameRaw } : {}),
      ...(productUrl ? { productUrl, merchantUrl: productUrl } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(priceLabelRaw ? { priceLabel: priceLabelRaw } : {}),
    });
  } else {
    await updateCatalogProductOverride(productId, {
      ...(titleRaw ? { title: titleRaw } : {}),
      ...(merchantNameRaw ? { merchantName: merchantNameRaw } : {}),
      ...(productUrl ? { productUrl } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(priceLabelRaw ? { priceLabel: priceLabelRaw } : {}),
    });
  }
  revalidatePath("/admin/catalog");
}

async function revertOverrideAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  await clearCatalogProductOverride(productId);
  revalidatePath("/admin/catalog");
}

async function addCatalogItemAction(formData: FormData) {
  "use server";
  const title = String(formData.get("title") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const merchantName = String(formData.get("merchantName") ?? "").trim();
  const productUrl = String(formData.get("productUrl") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const priceLabel = String(formData.get("priceLabel") ?? "").trim();
  const plannerMappingsRaw = String(formData.get("plannerMappings") ?? "").trim();
  const featured = String(formData.get("isFeatured") ?? "off") === "on";

  if (!title || !categoryRaw || !merchantName || !productUrl || !imageUrl || !shortDescription) return;
  if (!isValidHttpUrl(productUrl) || !isValidHttpUrl(imageUrl)) return;
  const category = categoryRaw as CatalogCategoryId;
  const plannerMappings = plannerMappingsRaw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const id = `custom_${Date.now()}`;
  let resolvedImageUrl = imageUrl;
  try { resolvedImageUrl = await mirrorImageToBlob(imageUrl, id); } catch { /* keep original */ }

  const customProduct: CatalogProduct = {
    id,
    title,
    category,
    shortDescription,
    imageUrl: resolvedImageUrl,
    merchantName,
    merchantUrl: productUrl,
    productUrl,
    priceLabel: priceLabel || undefined,
    qualityTier: "mid",
    tags: ["custom", "admin"],
    plannerMappings,
    lastCheckedAt: new Date().toISOString().slice(0, 10),
    isFeatured: featured,
    isActive: true,
    sourceType: "manual",
  };
  await addCustomCatalogProduct(customProduct);
  revalidatePath("/admin/catalog");
}

async function deleteCustomItemAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  await removeCustomCatalogProduct(productId);
  revalidatePath("/admin/catalog");
}

async function removeFromListAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const isCustom = String(formData.get("isCustom") ?? "false") === "true";
  if (!productId) return;
  if (isCustom) {
    await removeCustomCatalogProduct(productId);
  } else {
    await updateCatalogProductOverride(productId, { isDeleted: true });
  }
  revalidatePath("/admin/catalog");
}

async function restoreToListAction(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  await updateCatalogProductOverride(productId, { isDeleted: false });
  revalidatePath("/admin/catalog");
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type EffectiveCatalogProduct = CatalogProduct & { isDeleted: boolean };

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CatalogAdminPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const filterStatus = readSearchParam(resolvedParams, "status") || "all";
  const filterTask = readSearchParam(resolvedParams, "task") || "all";
  const filterCategory = readSearchParam(resolvedParams, "category") || "all";
  const PAGE_SIZE = 50;
  const currentPage = Math.max(1, parseInt(readSearchParam(resolvedParams, "page") || "1", 10));

  const state = await getCatalogAdminState();
  const baseProducts: EffectiveCatalogProduct[] = products.map((product) => {
    const override = state.productOverrides[product.id];
    if (!override) return { ...product, isDeleted: false };
    return {
      ...product,
      title: override.title ?? product.title,
      isActive: override.isActive ?? product.isActive,
      isFeatured: override.isFeatured ?? product.isFeatured,
      lastCheckedAt: override.lastCheckedAt ?? product.lastCheckedAt,
      merchantName: override.merchantName ?? product.merchantName,
      productUrl: override.productUrl ?? product.productUrl,
      imageUrl: override.imageUrl ?? product.imageUrl,
      priceLabel: override.priceLabel ?? product.priceLabel,
      isDeleted: override.isDeleted ?? false,
    };
  });
  const customProducts: EffectiveCatalogProduct[] = state.customProducts.map((product) => ({
    ...product,
    isDeleted: false,
  }));
  const effectiveProducts: EffectiveCatalogProduct[] = [...customProducts, ...baseProducts];
  const visibleProducts = effectiveProducts.filter((product) => !product.isDeleted);

  const filteredProducts = (filterStatus === "removed" ? effectiveProducts : visibleProducts).filter((product) => {
    if (filterCategory !== "all" && product.category !== filterCategory) return false;
    if (filterTask !== "all" && !product.plannerMappings.includes(filterTask)) return false;
    const stale = daysSince(product.lastCheckedAt) > 45;
    if (filterStatus === "removed" && !product.isDeleted) return false;
    if (filterStatus === "active" && !product.isActive) return false;
    if (filterStatus === "inactive" && product.isActive) return false;
    if (filterStatus === "stale" && !stale) return false;
    if (filterStatus === "featured" && !product.isFeatured) return false;
    return true;
  });

  const activeProducts = visibleProducts.filter((product) => product.isActive);
  const featuredProducts = activeProducts.filter((product) => product.isFeatured);
  const staleProducts = activeProducts.filter((product) => daysSince(product.lastCheckedAt) > 45);
  const removedProducts = effectiveProducts.filter((product) => product.isDeleted);

  const categoryUsage = categories
    .map((category) => ({
      ...category,
      activeProducts: activeProducts.filter((product) => product.category === category.id).length,
    }))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

  const knownTasks = [...new Set(plannerMappings.map((mapping) => mapping.taskId))]
    .sort((a, b) => a.localeCompare(b));

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontSize: 20, margin: 0, color: "var(--ink)" }}>Curated catalog admin</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="/api/backup/catalog"
              className="btn-g"
              style={{ textDecoration: "none", fontSize: 12, padding: "8px 12px" }}
            >
              ⬇ Backup (.zip)
            </a>
            <a
              href="/api/catalog-overrides"
              className="btn-g"
              style={{ textDecoration: "none", fontSize: 12, padding: "8px 12px" }}
            >
              Export overrides (JSON)
            </a>
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink3)", lineHeight: 1.6, maxWidth: 820 }}>
          Rucno kurirani katalog proizvoda povezan sa planner taskovima. Ovaj panel sluzi za operativnu kontrolu
          pokrivenosti, kvaliteta i svežine podataka pre nego što se proizvodi prikažu na sajtu.
        </p>
      </div>

      <CatalogCsvImport />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
        {[
          { label: "Kategorije", value: categories.filter((category) => category.isActive).length },
          { label: "Aktivni proizvodi", value: activeProducts.length },
          { label: "Featured proizvodi", value: featuredProducts.length },
          { label: "Stale (>45 dana)", value: staleProducts.length },
          { label: "Removed sa liste", value: removedProducts.length },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--bdr)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <p style={{ margin: 0, fontSize: 11, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              {stat.label}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <section
        style={{
          background: "var(--accbg)",
          border: "1px solid var(--accmid)",
          borderRadius: 10,
          padding: "12px 14px",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "var(--ink2)", lineHeight: 1.6 }}>
          <strong>Operativni checklist:</strong> proveri da svaki planner task ima mapiranje, da svaka ciljana kategorija ima
          minimum 2 aktivna proizvoda i da se polje <code>lastCheckedAt</code> osvežava barem na 45 dana.
        </p>
      </section>

      <section style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "12px 14px" }}>
        <form method="get" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
          <label style={{ fontSize: 12, color: "var(--ink3)" }}>
            Status
            <select name="status" defaultValue={filterStatus} className="fselect" style={{ marginTop: 4 }}>
              <option value="all">Svi</option>
              <option value="active">Aktivni</option>
              <option value="inactive">Neaktivni</option>
              <option value="featured">Featured</option>
              <option value="stale">Stale &gt; 45d</option>
              <option value="removed">Removed sa liste</option>
            </select>
          </label>
          <label style={{ fontSize: 12, color: "var(--ink3)" }}>
            Task
            <select name="task" defaultValue={filterTask} className="fselect" style={{ marginTop: 4 }}>
              <option value="all">Svi taskovi</option>
              {knownTasks.map((task) => (
                <option key={task} value={task}>
                  {task}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "var(--ink3)" }}>
            Kategorija
            <select name="category" defaultValue={filterCategory} className="fselect" style={{ marginTop: 4 }}>
              <option value="all">Sve kategorije</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.id}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button type="submit" className="btn-p" style={{ padding: "9px 14px", fontSize: 12 }}>
              Primeni filtere
            </button>
            <a href="/admin/catalog" className="btn-g" style={{ textDecoration: "none", padding: "9px 14px", fontSize: 12 }}>
              Reset
            </a>
          </div>
        </form>
      </section>

      <section style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "12px 14px" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 14, color: "var(--ink)" }}>Dodaj novi katalog item</h3>
        <form action={addCatalogItemAction} style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
          <input name="title" className="finput" placeholder="Naziv proizvoda" required />
          <select name="category" className="fselect" required defaultValue="">
            <option value="" disabled>Izaberi kategoriju</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.id}
              </option>
            ))}
          </select>
          <input name="merchantName" className="finput" placeholder="Merchant name" required />
          <input name="productUrl" type="url" className="finput" placeholder="https://..." required />
          <input name="imageUrl" type="url" className="finput" placeholder="Image URL" required />
          <input name="priceLabel" className="finput" placeholder="od 199 EUR" />
          <input name="plannerMappings" className="finput" placeholder="task1, task2 (npr. gate, fence)" />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink2)" }}>
            <input name="isFeatured" type="checkbox" />
            Featured
          </label>
          <textarea
            name="shortDescription"
            className="finput"
            placeholder="Kratak opis proizvoda"
            required
            style={{ gridColumn: "1 / span 3", minHeight: 74, resize: "vertical" }}
          />
          <button type="submit" className="btn-p" style={{ fontSize: 12, padding: "10px 14px" }}>
            Dodaj item
          </button>
        </form>
      </section>

      <section style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bdr)" }}>
          <h3 style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>Planner mapiranja po tasku</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bgw)", color: "var(--ink3)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Task ID</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Kategorije</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Fallback</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Prioritet</th>
              </tr>
            </thead>
            <tbody>
              {plannerMappings.map((mapping) => (
                <tr key={mapping.taskId}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{mapping.taskId}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    {mapping.categoryIds.join(", ")}
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    {(mapping.fallbackCategoryIds ?? []).join(", ") || "—"}
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    {mapping.priority ?? 50}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10 }}>
        <summary style={{
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          listStyle: "none",
          userSelect: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>Kategorije i pokrivenost</h3>
            <span style={{ fontSize: 11, color: "var(--ink4)" }}>
              {categoryUsage.filter((c) => c.activeProducts >= 2).length} / {categoryUsage.length} pokriveno
            </span>
          </div>
          <span style={{ fontSize: 11, color: "var(--ink4)", flexShrink: 0 }}>▼</span>
        </summary>
        <div style={{ borderTop: "1px solid var(--bdr)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bgw)", color: "var(--ink3)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Category ID</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Naziv</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Aktivni proizvodi</th>
              </tr>
            </thead>
            <tbody>
              {categoryUsage.map((category) => (
                <tr key={category.id}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{category.id}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{category.title.sr}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: category.activeProducts >= 2 ? "var(--grn)" : "#B45309" }}>
                      <span>{category.activeProducts}</span>
                      <span style={{ fontSize: 10 }}>
                        {category.activeProducts >= 2 ? "OK" : "dopuniti"}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <section style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>
            Proizvodi (rucno kurirani)
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, color: "var(--ink4)" }}>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredProducts.length)} od {filteredProducts.length}
            </span>
          </h3>
          {totalPages > 1 && (
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              filterStatus={filterStatus}
              filterTask={filterTask}
              filterCategory={filterCategory}
            />
          )}
        </div>
        <div style={{ padding: "12px 14px" }}>
          <CatalogProductsTable
            products={pagedProducts.map((product): TableProduct => ({
              id: product.id,
              title: product.title,
              category: product.category,
              isActive: product.isActive,
              isFeatured: product.isFeatured,
              isDeleted: product.isDeleted,
              lastCheckedAt: product.lastCheckedAt,
              staleDays: daysSince(product.lastCheckedAt),
              imageUrl: product.imageUrl,
              hasOverride: Boolean(state.productOverrides[product.id]),
              isCustom: product.id.startsWith("custom_"),
              merchantName: product.merchantName,
              productUrl: product.productUrl,
              priceLabel: product.priceLabel,
            }))}
            toggleActiveAction={toggleActiveAction}
            toggleFeaturedAction={toggleFeaturedAction}
            markCheckedTodayAction={markCheckedTodayAction}
            saveInlineMetadataAction={saveInlineMetadataAction}
            revertOverrideAction={revertOverrideAction}
            deleteCustomItemAction={deleteCustomItemAction}
            removeFromListAction={removeFromListAction}
            restoreToListAction={restoreToListAction}
          />
        </div>
        {totalPages > 1 && (
          <div style={{ padding: "12px 14px", borderTop: "1px solid var(--bdr)", display: "flex", justifyContent: "center" }}>
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              filterStatus={filterStatus}
              filterTask={filterTask}
              filterCategory={filterCategory}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  filterStatus,
  filterTask,
  filterCategory,
}: {
  currentPage: number;
  totalPages: number;
  filterStatus: string;
  filterTask: string;
  filterCategory: string;
}) {
  function pageUrl(page: number) {
    const p = new URLSearchParams();
    if (filterStatus !== "all") p.set("status", filterStatus);
    if (filterTask !== "all") p.set("task", filterTask);
    if (filterCategory !== "all") p.set("category", filterCategory);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return `/admin/catalog${qs ? `?${qs}` : ""}`;
  }

  // Show at most 7 page buttons: first, last, current ±2, ellipsis
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 32, height: 32, padding: "0 8px",
    borderRadius: 6, fontSize: 12, fontWeight: 500,
    textDecoration: "none", border: "1px solid var(--bdr2)",
    background: "var(--bgw)", color: "var(--ink2)", cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {currentPage > 1 && (
        <a href={pageUrl(currentPage - 1)} style={btnBase}>‹</a>
      )}
      {pages.map((p, idx) =>
        p === "…"
          ? <span key={`ellipsis-${idx}`} style={{ padding: "0 4px", fontSize: 12, color: "var(--ink4)" }}>…</span>
          : <a
              key={p}
              href={pageUrl(p)}
              style={{
                ...btnBase,
                ...(p === currentPage ? { background: "var(--acc)", color: "#fff", borderColor: "var(--acc)", fontWeight: 700 } : {}),
              }}
            >
              {p}
            </a>
      )}
      {currentPage < totalPages && (
        <a href={pageUrl(currentPage + 1)} style={btnBase}>›</a>
      )}
    </div>
  );
}
