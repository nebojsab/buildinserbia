/** Logo iz `public/Logo.svg` (širok wordmark — visina fiksna, širina auto). */
export function SiteLogo({ compact }: { compact?: boolean }) {
  const height = compact ? 20 : 24;
  return (
    <img
      src="/Logo.svg"
      alt="BuildInSerbia"
      width={605}
      height={79}
      style={{
        height,
        width: "auto",
        display: "block",
      }}
    />
  );
}
