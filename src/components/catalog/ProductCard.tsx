import type { CatalogProduct, QualityTier } from "../../types/catalog";
import type { Lang } from "../../translations";

const tierLabel: Record<Lang, Record<NonNullable<QualityTier>, string>> = {
  sr: {
    lower: "Nizi rang",
    mid: "Srednji rang",
    higher: "Visi rang",
  },
  en: {
    lower: "Lower tier",
    mid: "Mid tier",
    higher: "Higher tier",
  },
  ru: {
    lower: "Nizkiy segment",
    mid: "Sredniy segment",
    higher: "Vysokiy segment",
  },
};

export function ProductCard({
  product,
  lang,
  onProductClick,
}: {
  product: CatalogProduct;
  lang: Lang;
  onProductClick?: (product: CatalogProduct) => void;
}) {
  const href = product.affiliateUrl ?? product.productUrl;
  const cta =
    lang === "sr"
      ? "Pogledaj proizvod"
      : lang === "en"
        ? "View product"
        : "Smotret tovar";
  const merchantLabel =
    lang === "sr" ? "Prodavac" : lang === "en" ? "Merchant" : "Prodavets";
  const priceValue =
    product.priceLabel ??
    (product.price && product.currency ? `${product.price.toLocaleString()} ${product.currency}` : undefined);

  return (
    <article className="card" style={{ padding: 12, display: "grid", gap: 8 }}>
      <img
        src={product.imageUrl}
        alt={product.title}
        loading="lazy"
        style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }}
      />
      <h4 style={{ margin: 0, fontSize: 14, color: "var(--ink)" }}>{product.title}</h4>
      <p style={{ margin: 0, fontSize: 12, color: "var(--ink3)", lineHeight: 1.55 }}>
        {product.shortDescription}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: "var(--ink2)" }}>
        <strong>{merchantLabel}:</strong> {product.merchantName}
      </p>
      {priceValue ? (
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--acc)" }}>{priceValue}</p>
      ) : null}
      {product.qualityTier ? (
        <span
          style={{
            display: "inline-flex",
            width: "fit-content",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".05em",
            textTransform: "uppercase",
            padding: "3px 7px",
            borderRadius: 6,
            color: "var(--ink3)",
            background: "var(--bgw)",
            border: "1px solid var(--bdr)",
          }}
        >
          {tierLabel[lang][product.qualityTier]}
        </span>
      ) : null}
      <a
        className="btn-p"
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => onProductClick?.(product)}
        style={{ textDecoration: "none", justifyContent: "center", padding: "10px 14px", fontSize: 13 }}
      >
        {cta}
      </a>
    </article>
  );
}
