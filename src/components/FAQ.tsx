import { useState } from "react";

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className={`faq-item${open === i ? " open" : ""}`}>
          <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <h3 className="faq-qt">{it.q}</h3>
            <span className="faq-ico">{open === i ? "−" : "+"}</span>
          </div>
          {open === i && <div className="faq-a">{it.a}</div>}
        </div>
      ))}
    </div>
  );
}
