"use client";

export function AssistantLauncher({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open assistant"
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        zIndex: 120,
        borderRadius: 999,
        background: "var(--acc)",
        color: "#fff",
        border: "none",
        padding: "11px 16px",
        boxShadow: "var(--sh1)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span aria-hidden>?</span>
      <span>Assistant</span>
    </button>
  );
}
