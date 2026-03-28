import type { ReactNode } from "react";

export function HR() {
  return <hr className="div m-0" />;
}

export function Ey({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow" style={{ marginBottom: 12 }}>
      {children}
    </p>
  );
}
