import { getMaintenanceState } from "@/lib/maintenanceState";

export async function GET() {
  const status = await getMaintenanceState();

  return Response.json({
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
  });
}

