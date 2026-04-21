"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="btn-p" onClick={() => window.print()}>
      {label}
    </button>
  );
}
