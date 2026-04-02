import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "bis_admin_session";
/** Readable on the public origin so the landing app can skip coming-soon; keep in sync with `src/lib/publicPreviewBypass.ts`. */
const PUBLIC_PREVIEW_COOKIE = "bis_public_preview";

function publicPreviewCookieOptions(): {
  httpOnly: false;
  path: "/";
  maxAge: number;
  sameSite: "lax";
  secure: boolean;
  domain?: string;
} {
  const secure = process.env.NODE_ENV === "production";
  const domain = process.env.COOKIE_DOMAIN?.trim();
  return {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure,
    ...(domain ? { domain } : {}),
  };
}

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  cookieStore.set(PUBLIC_PREVIEW_COOKIE, "1", publicPreviewCookieOptions());
}

export async function signOut() {
  const cookieStore = await cookies();
  const previewOpts = publicPreviewCookieOptions();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete({
    name: PUBLIC_PREVIEW_COOKIE,
    path: previewOpts.path,
    ...(previewOpts.domain ? { domain: previewOpts.domain } : {}),
  });
  redirect("/login");
}

