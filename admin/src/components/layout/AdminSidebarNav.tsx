"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/maintenance", label: "Podesavanja Vidljivosti" },
  { href: "/admin/catalog", label: "Curated catalog" },
  { href: "/admin/document-library", label: "Document library" },
  { href: "/admin/blog-posts", label: "Blog posts" },
  { href: "/media", label: "Media library" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              color: active ? "var(--acc2)" : "var(--ink2)",
              background: active ? "var(--accbg)" : "transparent",
              border: active ? "1px solid var(--accmid)" : "1px solid transparent",
              fontWeight: active ? 600 : 500,
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
