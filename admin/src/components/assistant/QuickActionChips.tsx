"use client";

export function QuickActionChips({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="btn-g"
          style={{ fontSize: 12, padding: "6px 10px" }}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
