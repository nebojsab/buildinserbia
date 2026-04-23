"use client";

export function AssistantDisclaimer({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
      {items.map((item) => (
        <p
          key={item}
          style={{
            fontSize: 11.5,
            color: "var(--amb)",
            background: "var(--ambbg)",
            border: "1px solid var(--ambmid)",
            borderRadius: 8,
            padding: "6px 8px",
            lineHeight: 1.45,
          }}
        >
          {item}
        </p>
      ))}
    </div>
  );
}
