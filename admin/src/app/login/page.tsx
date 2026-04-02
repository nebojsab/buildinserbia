import { redirect } from "next/navigation";
import { getCurrentUser, getEnvCreds, signIn } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";

  const username = formData.get("username")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const { user, pass } = getEnvCreds();

  if (username === user && password === pass) {
    await signIn(username);
    redirect("/admin");
  }

  redirect("/login?error=1");
}

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 380, width: "100%" }}>
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>
            BuildInSerbia
          </p>
          <h1
            style={{
              fontFamily: "var(--heading)",
              fontSize: 22,
              fontWeight: 500,
              color: "var(--ink)",
              lineHeight: 1.3,
              letterSpacing: "-.01em",
            }}
          >
            Admin pristup
          </h1>
        </div>
        <div
          className="card"
          style={{
            padding: "22px 20px 20px",
          }}
        >
          <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--ink3)",
                  marginBottom: 6,
                  fontFamily: "var(--sans)",
                }}
              >
                Username
              </label>
              <input
                name="username"
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "var(--r)",
                  border: "1.5px solid var(--bdr)",
                  background: "var(--bg)",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--ink3)",
                  marginBottom: 6,
                  fontFamily: "var(--sans)",
                }}
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "9px 11px",
                  borderRadius: "var(--r)",
                  border: "1.5px solid var(--bdr)",
                  background: "var(--bg)",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                }}
              />
            </div>

            <button type="submit" className="btn-p" style={{ width: "100%", marginTop: 4 }}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

