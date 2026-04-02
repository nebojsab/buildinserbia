import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "bis_admin_session";

export type AdminUser = {
  username: string;
};

export function getEnvCreds() {
  const user = process.env.ADMIN_USERNAME ?? "admin";
  const pass = process.env.ADMIN_PASSWORD ?? "root";
  return { user, pass };
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AdminUser;
    if (!parsed.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function signIn(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify({ username }), {
    httpOnly: true,
    path: "/",
  });
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

