/** Must match admin `PUBLIC_PREVIEW_COOKIE` in `admin/src/lib/auth.ts`. */
export const PUBLIC_PREVIEW_COOKIE = "bis_public_preview";
export const PUBLIC_PREVIEW_SESSION_KEY = "bis_public_preview";
export const PUBLIC_PREVIEW_QUERY = "bis_preview";

/**
 * True when the visitor should see the real site despite COMING_SOON / MAINTENANCE:
 * - `?bis_preview=1` (stored in sessionStorage; query stripped)
 * - sessionStorage from a previous preview visit
 * - non-httpOnly cookie set on admin login (same parent domain in production)
 */
export function getPublicPreviewBypassFromWindow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(PUBLIC_PREVIEW_QUERY) === "1") {
      sessionStorage.setItem(PUBLIC_PREVIEW_SESSION_KEY, "1");
      url.searchParams.delete(PUBLIC_PREVIEW_QUERY);
      const qs = url.searchParams.toString();
      window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : "") + url.hash);
      return true;
    }
    if (sessionStorage.getItem(PUBLIC_PREVIEW_SESSION_KEY) === "1") return true;
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${PUBLIC_PREVIEW_COOKIE}=1`));
  } catch {
    return false;
  }
}
