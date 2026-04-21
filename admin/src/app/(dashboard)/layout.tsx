import type { ReactNode } from "react";
import { requireAuth, signOut } from "@/lib/auth";
import { getPublicSiteUrl } from "@/lib/publicSiteUrl";
import { AdminSidebarNav } from "@/components/layout/AdminSidebarNav";

async function logoutAction() {
  "use server";
  await signOut();
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();
  const publicSiteRoot = `${getPublicSiteUrl()}/`;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--sans)",
      }}
    >
      <aside
        style={{
          width: 240,
          borderRight: "1px solid var(--bdr)",
          background: "var(--bgw)",
          padding: "20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <a href={publicSiteRoot} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <img
            src="/Logo.svg"
            alt="Build in Serbia"
            style={{ height: 22, width: "auto", maxWidth: 180, display: "block" }}
          />
        </a>
        <AdminSidebarNav />
      </aside>

      <div style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px",
            borderBottom: "1px solid var(--bdr)",
            background: "var(--bgw)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 14, fontWeight: 500, fontFamily: "var(--heading)", color: "var(--ink2)", margin: 0 }}>
              {/* Dashboard */}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              aria-label="Notifications"
              style={{
                width: 30,
                height: 30,
                borderRadius: "999px",
                border: "1px solid var(--bdr2)",
                background: "var(--card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              🔔
            </button>
            <button
              type="button"
              aria-label="Messages"
              style={{
                width: 30,
                height: 30,
                borderRadius: "999px",
                border: "1px solid var(--bdr2)",
                background: "var(--card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              ✉️
            </button>
            <div style={{ position: "relative" }}>
              <details>
                <summary
                  style={{
                    listStyle: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid var(--bdr2)",
                    background: "var(--card)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--ink)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "var(--sans)",
                    }}
                  >
                    {user.username[0]?.toUpperCase() ?? "A"}
                  </span>
                  <span style={{ color: "var(--ink2)" }}>Menu</span>
                </summary>
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 6,
                    width: 180,
                    background: "var(--card)",
                    borderRadius: 10,
                    border: "1px solid var(--bdr)",
                    boxShadow: "var(--sh2)",
                    padding: 6,
                    fontSize: 12,
                    zIndex: 20,
                  }}
                >
                  <button
                    type="button"
                    className="btn-g"
                    style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4 }}
                  >
                    My profile
                  </button>
                  <button
                    type="button"
                    className="btn-g"
                    style={{ width: "100%", justifyContent: "flex-start", marginBottom: 4 }}
                  >
                    Account settings
                  </button>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "#DC2626",
                        textAlign: "left",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "24px" }}>{children}</main>
      </div>
    </div>
  );
}

