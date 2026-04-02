import { requireAuth } from "@/lib/auth";
import type { Metadata } from "next";
import { getMaintenanceState, setMaintenanceState } from "@/lib/maintenanceState";
import type { SearchParams } from "next/dist/server/request/search-params";
import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { MaintenanceAdminPanel } from "./MaintenanceAdminPanel";
import { DEFAULT_LANGS } from "./maintenanceDefaults";
import { put } from "@vercel/blob";

async function updateMaintenance(formData: FormData) {
  "use server";
  const user = await requireAuth();
  const mode = (formData.get("mode") as string) || "NORMAL";
  const canUseBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  const current = await getMaintenanceState();
  const finalMode = mode as "NORMAL" | "READ_ONLY" | "MAINTENANCE" | "COMING_SOON";

  const resetAll = formData.get("resetAll")?.toString() === "1";
  if (resetAll) {
    await setMaintenanceState({
      mode: finalMode,
      bgMode: "COLOR",
      bgImagePath: null,
      countdownAt: null,
      messageSr: null,
      messageEn: null,
      messageRu: null,
      langs: DEFAULT_LANGS,
    });
    redirect("/maintenance?saved=1");
    return;
  }

  // U režimu NORMAL/READ_ONLY/MAINTENANCE samo menjamo mode.
  // Ne diramo countdown/bg/lang sadržaj da ti se "coming soon" ne briše slučajno.
  if (finalMode !== "COMING_SOON") {
    await setMaintenanceState({ mode: finalMode });
    console.log("Maintenance updated by", user.username, "=>", finalMode);
    redirect("/maintenance?saved=1");
    return;
  }

  const countdownRaw = formData.get("countdownAt")?.toString() || "";
  const countdownAt = countdownRaw && !Number.isNaN(Date.parse(countdownRaw)) ? new Date(countdownRaw).toISOString() : null;

  type Lang = "sr" | "en" | "ru";
  type ButtonConfig = { label: string | null; url: string | null; enabled: boolean };
  type LangBlock = {
    heading: string | null;
    subTitle: string | null;
    body: string | null;
    countdownLabel: string | null;
    footerNote: string | null;
    primary: ButtonConfig;
    secondary: ButtonConfig;
  };

  const langs = ["sr", "en", "ru"] as const;

  const emptyBtn: ButtonConfig = { label: null, url: null, enabled: false };
  const emptyLangBlock: LangBlock = {
    heading: null,
    subTitle: null,
    body: null,
    countdownLabel: null,
    footerNote: null,
    primary: emptyBtn,
    secondary: emptyBtn,
  };

  const nextLangs: Record<Lang, LangBlock> = {
    sr: { ...emptyLangBlock, primary: { ...emptyBtn }, secondary: { ...emptyBtn } },
    en: { ...emptyLangBlock, primary: { ...emptyBtn }, secondary: { ...emptyBtn } },
    ru: { ...emptyLangBlock, primary: { ...emptyBtn }, secondary: { ...emptyBtn } },
  };

  for (const l of langs) {
    const prefix = l;
    const heading = formData.get(`${prefix}Heading`)?.toString() || null;
    const subTitle = formData.get(`${prefix}SubTitle`)?.toString() || null;
    const body = formData.get(`${prefix}Body`)?.toString() || null;
    const countdownLabel = formData.get(`${prefix}CountdownLabel`)?.toString() || null;
    const footerNote = formData.get(`${prefix}FooterNote`)?.toString() || null;
    const primaryLabel = formData.get(`${prefix}PrimaryLabel`)?.toString() || null;
    const primaryUrl = formData.get(`${prefix}PrimaryUrl`)?.toString() || null;
    const primaryEnabled = formData.get(`${prefix}PrimaryEnabled`) === "on";
    const secondaryLabel = formData.get(`${prefix}SecondaryLabel`)?.toString() || null;
    const secondaryUrl = formData.get(`${prefix}SecondaryUrl`)?.toString() || null;
    const secondaryEnabled = formData.get(`${prefix}SecondaryEnabled`) === "on";

    nextLangs[l] = {
      heading,
      subTitle,
      body,
      countdownLabel,
      footerNote,
      primary: { label: primaryLabel, url: primaryUrl, enabled: primaryEnabled },
      secondary: { label: secondaryLabel, url: secondaryUrl, enabled: secondaryEnabled },
    };
  }

  const bgModeRaw = formData.get("bgMode")?.toString() || current.bgMode;
  const removeBgImage = formData.get("removeBgImage") === "on";
  const bgMode: "COLOR" | "IMAGE" = bgModeRaw === "IMAGE" ? "IMAGE" : "COLOR";
  const effectiveBgMode: "COLOR" | "IMAGE" = removeBgImage ? "COLOR" : bgMode;

  let bgImagePath: string | null = current.bgImagePath;

  // Uklanjanje slike ili odabir solid color -> ne koristiti image.
  if (effectiveBgMode === "COLOR" || removeBgImage) {
    bgImagePath = null;
  }

  type FileLike = { arrayBuffer: () => Promise<ArrayBuffer>; size: number; name?: string };
  const fileEntry = formData.get("bgImage");
  if (effectiveBgMode === "IMAGE" && !removeBgImage && bgImagePath !== null) {
    // keep existing unless a new file is uploaded
  }
  if (effectiveBgMode === "IMAGE" && !removeBgImage && fileEntry && typeof fileEntry !== "string") {
    const fileLike = fileEntry as unknown as FileLike;
    if (typeof fileLike.arrayBuffer === "function" && typeof fileLike.size === "number" && fileLike.size > 0) {
      const bytes = await fileLike.arrayBuffer();
      const ext = (fileLike.name?.split(".").pop() || "jpg").toLowerCase();

      try {
        if (canUseBlob) {
          const pathname = `maintenance/background-${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
          const blob = await put(pathname, bytes, { access: "public" });
          bgImagePath = blob.url;
        } else {
          const uploadsDir = path.join(process.cwd(), "public", "maintenance");
          fs.mkdirSync(uploadsDir, { recursive: true });
          const filename = `background.${ext}`;
          const fullPath = path.join(uploadsDir, filename);
          fs.writeFileSync(fullPath, Buffer.from(bytes));
          bgImagePath = `/maintenance/${filename}`;
        }
      } catch {
        bgImagePath = null;
      }
    }
  }

  await setMaintenanceState({
    mode: finalMode,
    bgMode: effectiveBgMode,
    countdownAt,
    bgImagePath,
    langs: nextLangs,
  });

  console.log("Maintenance updated by", user.username, "=>", finalMode);
  redirect("/maintenance?saved=1");
  return;
}

export const metadata: Metadata = {
  title: "BuildInSerbia · Maintenance",
};

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAuth();
  const status = await getMaintenanceState();
  const sp = await searchParams;
  const saved = sp?.saved === "1";

  return (
    <div style={{ maxWidth: 640 }}>
      <h2
        style={{
          fontFamily: "var(--heading)",
          fontSize: 20,
          fontWeight: 500,
          color: "var(--ink)",
          marginBottom: 6,
        }}
      >
        Maintenance &amp; status
      </h2>
      <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 18, fontFamily: "var(--sans)" }}>
        Kontroliše šta javni BuildInSerbia sajt prikazuje na root adresi (normalan rad, coming soon ili
        maintenance ekran).
      </p>

      <form
        id="maintenance-form"
        action={async (formData) => {
          "use server";
          await updateMaintenance(formData);
        }}
        className="card maintenance-card"
        style={{ padding: "18px 20px", fontSize: 13, position: "relative", paddingBottom: 180 }}
      >
        <MaintenanceAdminPanel status={status} saved={saved} />
      </form>
    </div>
  );
}


