/** Logo iz `public/Logo.svg` (širok wordmark — visina fiksna, širina auto). */
export function SiteLogo({
  compact,
  loading,
  priority,
}: {
  compact?: boolean;
  loading?: "lazy" | "eager";
  /** Above-the-fold logo in header — avoids lazy-loading LCP image. */
  priority?: boolean;
}) {
  const height = compact ? 20 : 24;
  const load = loading ?? (priority ? "eager" : compact ? "lazy" : "eager");
  return (
    <img
      src="/Logo.svg"
      alt="Build in Serbia — planiranje gradnje kuće i renoviranja stana u Srbiji"
      width={605}
      height={79}
      loading={load}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      style={{
        height,
        width: "auto",
        display: "block",
      }}
    />
  );
}
