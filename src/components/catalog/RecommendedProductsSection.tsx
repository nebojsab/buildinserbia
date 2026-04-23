import { ProductCard } from "./ProductCard";
import type { RecommendedProductsResult } from "../../types/catalog";
import type { Lang } from "../../translations";
import type { CatalogProduct } from "../../types/catalog";

export function RecommendedProductsSection({
  data,
  lang,
  selectedTasks,
}: {
  data: RecommendedProductsResult;
  lang: Lang;
  selectedTasks: string[];
}) {
  const copy =
    lang === "sr"
      ? {
          title: "Mozda ce vam trebati i ovo",
          helper:
            "Na osnovu izabranih radova izdvojili smo relevantne proizvode iz rucno kuriranog kataloga.",
          related: "Popularne opcije",
          disclaimer:
            "Cene i dostupnost su informativne i mogu se promeniti. Pre kupovine proverite aktuelne uslove kod prodavca.",
          emptyTitle: "Trenutno nemamo direktne predloge",
          emptyText:
            "Za izabrani scenario jos uvek dopunjavamo katalog. Pogledajte popularne opcije ispod.",
        }
      : lang === "en"
        ? {
            title: "You might also need these",
            helper:
              "Based on selected tasks, we highlighted relevant products from our curated catalog.",
            related: "Popular options",
            disclaimer:
              "Prices and availability are informational and may change. Please verify current details with the merchant.",
            emptyTitle: "No direct suggestions yet",
            emptyText:
              "We are still expanding the catalog for this scenario. Please check popular options below.",
          }
        : {
            title: "Mozhet byt polezno",
            helper:
              "Na osnove vybrannykh rabot my podobraly relevantnye tovary iz kuriruemogo kataloga.",
            related: "Populyarnye varianty",
            disclaimer:
              "Tseny i nalichie informativnye i mogut menatsya. Utochnyayte aktualnye usloviya u prodavtsa.",
            emptyTitle: "Pryamykh rekomendatsiy poka net",
            emptyText:
              "My rasshiryayem katalog dlya etogo stsenariya. Posmotrite populyarnye varianty nizhe.",
          };

  const trackProductClick = (product: CatalogProduct, placement: "group" | "related") => {
    if (typeof window === "undefined") return;
    const payload = {
      productId: product.id,
      productTitle: product.title,
      category: product.category,
      merchant: product.merchantName,
      placement,
      selectedTasks,
    };
    const va = (window as Window & { va?: { track?: (event: string, data?: Record<string, unknown>) => void } }).va;
    va?.track?.("catalog_product_click", payload);
    window.dispatchEvent(
      new CustomEvent("buildinserbia:catalog_product_click", {
        detail: payload,
      }),
    );
  };

  if (data.empty) {
    return (
      <div className="card" style={{ padding: 16, marginBottom: 28 }}>
        <h3 style={{ marginTop: 0, fontFamily: "var(--heading)", fontSize: 20 }}>{copy.title}</h3>
        <p style={{ margin: "6px 0 0", color: "var(--ink3)", lineHeight: 1.6 }}>{copy.emptyText}</p>
      </div>
    );
  }

  return (
    <section className="card" style={{ overflow: "hidden", marginBottom: 28 }}>
      <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid var(--bdr)" }}>
        <h3 style={{ margin: 0, fontFamily: "var(--heading)", fontSize: 21, color: "var(--ink)" }}>
          {copy.title}
        </h3>
        <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink3)", lineHeight: 1.6 }}>
          {copy.helper}
        </p>
      </div>
      <div style={{ padding: "16px 24px 20px", display: "grid", gap: 16 }}>
        {data.groups.map((group) => (
          <div key={group.categoryId} style={{ display: "grid", gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink3)" }}>
              {group.categoryTitle}
            </h4>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}
              className="docs-g"
            >
              {group.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  onProductClick={(clicked) => trackProductClick(clicked, "group")}
                />
              ))}
            </div>
          </div>
        ))}

        {data.relatedProducts.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink3)" }}>
              {copy.related}
            </h4>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}
              className="docs-g"
            >
              {data.relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                  onProductClick={(clicked) => trackProductClick(clicked, "related")}
                />
              ))}
            </div>
          </div>
        ) : null}
        <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink4)", lineHeight: 1.55 }}>{copy.disclaimer}</p>
      </div>
    </section>
  );
}
