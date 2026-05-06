"use client";

export function AssistantLauncher({
  onClick,
  locale = "sr",
}: {
  onClick: () => void;
  locale?: string;
}) {
  const label = locale === "en" ? "Open assistant" : locale === "ru" ? "Открыть помощника" : "Otvori asistenta";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="back-to-top-floater"
      style={{
        bottom: 22,
        zIndex: 120,
        fontSize: 18,
        fontWeight: 700,
        color: "var(--ink2)",
        fontFamily: "var(--sans)",
      }}
    >
      ?
    </button>
  );
}
