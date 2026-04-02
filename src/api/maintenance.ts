export type MaintenancePayload = {
  /** Set by GET /api/status when admin session cookie is present (requires credentials on fetch). */
  previewBypass?: boolean;
  mode: "NORMAL" | "READ_ONLY" | "MAINTENANCE" | "COMING_SOON";
  messageSr: string | null;
  messageEn: string | null;
  messageRu: string | null;
  startsAt: string | null;
  endsAt: string | null;
  bgMode: "COLOR" | "IMAGE";
  bgImagePath: string | null;
  countdownAt: string | null;
  langs: {
    sr: {
      heading: string | null;
      subTitle: string | null;
      body: string | null;
      countdownLabel: string | null;
      footerNote: string | null;
      primary: { label: string | null; url: string | null; enabled: boolean };
      secondary: { label: string | null; url: string | null; enabled: boolean };
    };
    en: {
      heading: string | null;
      subTitle: string | null;
      body: string | null;
      countdownLabel: string | null;
      footerNote: string | null;
      primary: { label: string | null; url: string | null; enabled: boolean };
      secondary: { label: string | null; url: string | null; enabled: boolean };
    };
    ru: {
      heading: string | null;
      subTitle: string | null;
      body: string | null;
      countdownLabel: string | null;
      footerNote: string | null;
      primary: { label: string | null; url: string | null; enabled: boolean };
      secondary: { label: string | null; url: string | null; enabled: boolean };
    };
  };
};

function resolveAdminBase(): string {
  // Vite: use VITE_ADMIN_BASE_URL when available
  const viteBase =
    typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ADMIN_BASE_URL
      ? (import.meta as any).env.VITE_ADMIN_BASE_URL
      : undefined;

  // Next / Node: use NEXT_PUBLIC_ADMIN_BASE_URL when available
  const nextBase =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_BASE_URL
      ? process.env.NEXT_PUBLIC_ADMIN_BASE_URL
      : undefined;

  // Fallback: same-origin
  return viteBase ?? nextBase ?? "";
}

const ADMIN_BASE = resolveAdminBase();

export async function fetchMaintenance(): Promise<MaintenancePayload | null> {
  try {
    const base = ADMIN_BASE;
    const ts = Date.now();
    const url = base ? `${base}/api/status?ts=${ts}` : `/api/status?ts=${ts}`;
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      mode: "cors",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as MaintenancePayload;
  } catch {
    return null;
  }
}

