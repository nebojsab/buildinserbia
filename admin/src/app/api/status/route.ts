import { getMaintenanceState } from "@/lib/maintenanceState";
import { getCurrentUser } from "@/lib/auth";
import { corsHeaders } from "@/lib/publicSiteCors";

export async function OPTIONS(request: Request) {
  const headers = corsHeaders(request);
  if (!headers.has("Access-Control-Allow-Origin")) {
    return new Response(null, { status: 204 });
  }
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Cache-Control, Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const [user, status] = await Promise.all([getCurrentUser(), getMaintenanceState()]);

  const body = {
    mode: status.mode,
    messageSr: status.messageSr,
    messageEn: status.messageEn,
    messageRu: status.messageRu,
    startsAt: null,
    endsAt: null,
    bgMode: status.bgMode,
    bgImagePath: status.bgImagePath,
    countdownAt: status.countdownAt,
    langs: status.langs,
    /** True when this request carries a valid admin session (public app uses credentials: include). */
    previewBypass: user != null,
  };

  const headers = corsHeaders(request);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { headers });
}

