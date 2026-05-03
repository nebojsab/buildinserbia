"use client";

export function QuickActionChips({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="btn-g"
          style={{ fontSize: 11.5, padding: "7px 8px", lineHeight: 1.35, textAlign: "left", alignItems: "flex-start" }}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
