/**
 * Tekstualni wordmark (BuildInSerbia) — trenutno nije u upotrebi.
 * Ostavljen za kasnije; u UI se koristi `SiteLogo` + `public/Logo.svg`.
 */
export function SiteLogoText({ compact }: { compact?: boolean }) {
  const fs = compact ? 18 : 22;
  return (
    <span
      title="BuildInSerbia"
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--sans)",
        fontWeight: 700,
        fontSize: fs,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: "var(--ink)",
      }}
    >
      <span>Build</span>
      <span>In</span>
      <span>Serbia</span>
    </span>
  );
}
