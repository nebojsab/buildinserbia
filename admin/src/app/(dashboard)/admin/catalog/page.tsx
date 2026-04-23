import { categories } from "@shared/data/catalog/categories";
import { plannerMappings } from "@shared/data/catalog/plannerMappings";
import { products } from "@shared/data/catalog/products";
import type { CatalogCategoryId, CatalogProduct } from "@shared/types/catalog";
import { revalidatePath } from "next/cache";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import {
  addCustomCatalogProduct,
  clearCatalogProductOverride,
  getCatalogAdminState,
  removeCustomCatalogProduct,
  updateCatalogProductOverride,
} from "@/lib/catalogAdminState";

function daysSince(dateIso: string): number {
  const now = Date.now();
  const then = new Date(dateIso).getTime();
  if (!Number.isFinite(then)) return 999;
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect width='120' height='80' fill='%23f3f4f6'/%3E%3Ctext x='60' y='44' font-size='10' text-anchor='middle' fill='%236b7280' font-family='Arial,sans-serif'%3ENo image%3C/text%3E%3C/svg%3E";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function resolveImageUrl(value: string): string {
  return isValidHttpUrl(value) ? value : IMAGE_PLACEHOLDER;
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

  const merchantNameRaw = String(formData.get("merchantName") ?? "").trim();
  const productUrlRaw = String(formData.get("productUrl") ?? "").trim();
  const imageUrlRaw = String(formData.get("imageUrl") ?? "").trim();
  const priceLabelRaw = String(formData.get("priceLabel") ?? "").trim();
  const productUrl = productUrlRaw && isValidHttpUrl(productUrlRaw) ? productUrlRaw : "";
  const imageUrl = imageUrlRaw && isValidHttpUrl(imageUrlRaw) ? imageUrlRaw : "";

  await updateCatalogProductOverride(productId, {
    merchantName: merchantNameRaw || undefined,
    productUrl: productUrl || undefined,
    imageUrl: imageUrl || undefined,
    priceLabel: priceLabelRaw || undefined,
  });
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
  const customProduct: CatalogProduct = {
    id,
    title,
    category,
    shortDescription,
    imageUrl,
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

  const state = await getCatalogAdminState();
  const baseProducts: EffectiveCatalogProduct[] = products.map((product) => {
    const override = state.productOverrides[product.id];
    if (!override) return { ...product, isDeleted: false };
    return {
      ...product,
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

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontSize: 20, margin: 0, color: "var(--ink)" }}>Curated catalog admin</h2>
          <a
            href="/api/catalog-overrides"
            className="btn-g"
            style={{ textDecoration: "none", fontSize: 12, padding: "8px 12px" }}
          >
            Export overrides (JSON)
          </a>
        </div>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink3)", lineHeight: 1.6, maxWidth: 820 }}>
          Rucno kurirani katalog proizvoda povezan sa planner taskovima. Ovaj panel sluzi za operativnu kontrolu
          pokrivenosti, kvaliteta i svežine podataka pre nego što se proizvodi prikažu na sajtu.
        </p>
      </div>

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

      <section style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bdr)" }}>
          <h3 style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>Kategorije i pokrivenost</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
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
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: category.activeProducts >= 2 ? "var(--grn)" : "#B45309",
                      }}
                    >
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
      </section>

      <section style={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bdr)" }}>
          <h3 style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>
            Proizvodi (rucno kurirani) - prikaz: {filteredProducts.length}
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bgw)", color: "var(--ink3)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>ID</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Slika</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Naslov</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Kategorija</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Featured</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Last checked</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Status</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Override</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Akcije</th>
                <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>Inline edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const staleDays = daysSince(product.lastCheckedAt);
                const hasOverride = Boolean(state.productOverrides[product.id]);
                const isCustom = product.id.startsWith("custom_");
                const imageSrc = resolveImageUrl(product.imageUrl);
                return (
                  <tr key={product.id}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{product.id}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <img
                        src={imageSrc}
                        alt={product.title}
                        width={54}
                        height={36}
                        style={{ objectFit: "cover", borderRadius: 6, border: "1px solid var(--bdr)" }}
                      />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{product.title}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>{product.category}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      {product.isFeatured ? "Yes" : "No"}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      {product.lastCheckedAt} ({staleDays}d)
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          background: product.isDeleted ? "#FEE2E2" : staleDays > 45 ? "#FEF3C7" : "#DCFCE7",
                          color: product.isDeleted ? "#991B1B" : staleDays > 45 ? "#92400E" : "#166534",
                          border: `1px solid ${product.isDeleted ? "#FCA5A5" : staleDays > 45 ? "#FCD34D" : "#86EFAC"}`,
                        }}
                      >
                        {product.isDeleted ? "removed" : staleDays > 45 ? "stale" : "fresh"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          background: hasOverride || isCustom ? "#DBEAFE" : "#F3F4F6",
                          color: hasOverride || isCustom ? "#1D4ED8" : "#6B7280",
                          border: `1px solid ${hasOverride || isCustom ? "#93C5FD" : "#E5E7EB"}`,
                        }}
                      >
                        {isCustom ? "custom item" : hasOverride ? "override" : "base"}
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
                            <input type="hidden" name="isCustom" value={String(isCustom)} />
                            <ConfirmSubmitButton
                              message="Da li ste sigurni da zelite da uklonite ovaj item sa liste?"
                              className="btn-g"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                            >
                              Obrisi sa liste
                            </ConfirmSubmitButton>
                          </form>
                        )}
                        {isCustom && !product.isDeleted ? (
                          <form action={deleteCustomItemAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <ConfirmSubmitButton
                              message="Da li ste sigurni da zelite trajno da obrisete custom item?"
                              className="btn-g"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                            >
                              Delete custom
                            </ConfirmSubmitButton>
                          </form>
                        ) : hasOverride ? (
                          <form action={revertOverrideAction}>
                            <input type="hidden" name="productId" value={product.id} />
                            <ConfirmSubmitButton
                              message="Da li ste sigurni da zelite da revertujete override za ovaj item?"
                              className="btn-g"
                              style={{ padding: "4px 8px", fontSize: 11 }}
                            >
                              Revert override
                            </ConfirmSubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--bdr)", minWidth: 300 }}>
                      <form action={saveInlineMetadataAction} style={{ display: "grid", gap: 6 }}>
                        <input type="hidden" name="productId" value={product.id} />
                        <input
                          type="text"
                          name="merchantName"
                          defaultValue={product.merchantName}
                          className="finput"
                          style={{ padding: "6px 8px", fontSize: 11 }}
                          placeholder="Merchant name"
                        />
                        <input
                          type="text"
                          name="priceLabel"
                          defaultValue={product.priceLabel ?? ""}
                          className="finput"
                          style={{ padding: "6px 8px", fontSize: 11 }}
                          placeholder="Price label"
                        />
                        <input
                          type="url"
                          name="productUrl"
                          defaultValue={product.productUrl}
                          className="finput"
                          style={{ padding: "6px 8px", fontSize: 11 }}
                          placeholder="Product URL"
                        />
                        <input
                          type="url"
                          name="imageUrl"
                          defaultValue={product.imageUrl}
                          className="finput"
                          style={{ padding: "6px 8px", fontSize: 11 }}
                          placeholder="Image URL"
                        />
                        <button type="submit" className="btn-p" style={{ padding: "6px 10px", fontSize: 11 }}>
                          Save metadata
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
