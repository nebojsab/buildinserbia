import fs from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";

type Mode = "NORMAL" | "READ_ONLY" | "MAINTENANCE" | "COMING_SOON";
type BgMode = "COLOR" | "IMAGE";

type Lang = "sr" | "en" | "ru";

type ButtonConfig = {
  label: string | null;
  url: string | null;
  enabled: boolean;
};

type LangBlock = {
  heading: string | null;
  subTitle: string | null;
  body: string | null;
  countdownLabel: string | null;
  footerNote: string | null;
  primary: ButtonConfig;
  secondary: ButtonConfig;
};

type State = {
  mode: Mode;
  messageSr: string | null;
  messageEn: string | null;
  messageRu: string | null;
  bgMode: BgMode;
  bgImagePath: string | null;
  countdownAt: string | null;
  langs: Record<Lang, LangBlock>;
};

const STATE_FILE = path.join(process.cwd(), "maintenance-state.json");
const STATE_BLOB_PATH = "maintenance-state.json";
const canUseBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

function parseStateFromJson(raw: string): State {
  type ParsedStateMaybe = Partial<State> & {
    mode?: Mode;
    langs?: Record<Lang, LangBlock>;
    bgMode?: BgMode;
    bgImagePath?: string | null;
    countdownAt?: string | null;
  };

  const parsed = JSON.parse(raw) as ParsedStateMaybe;
  if (!parsed.mode) throw new Error("invalid");

  // Backfill older state files that don't have new fields yet.
  const baseLangBlock: LangBlock = {
    heading: null,
    subTitle: null,
    body: null,
    countdownLabel: null,
    footerNote: null,
    primary: { label: null, url: null, enabled: false },
    secondary: { label: null, url: null, enabled: false },
  };

  const parsedLangs = parsed.langs;
  const mergeLang = (lang: Lang): LangBlock => {
    const incoming = parsedLangs?.[lang];
    return {
      ...baseLangBlock,
      ...incoming,
      primary: {
        ...baseLangBlock.primary,
        ...(incoming?.primary ?? {}),
      },
      secondary: {
        ...baseLangBlock.secondary,
        ...(incoming?.secondary ?? {}),
      },
    };
  };

  const langs: Record<Lang, LangBlock> = {
    sr: mergeLang("sr"),
    en: mergeLang("en"),
    ru: mergeLang("ru"),
  };

  const bgImagePath = typeof parsed.bgImagePath === "undefined" ? null : parsed.bgImagePath;
  const countdownAt = typeof parsed.countdownAt === "undefined" ? null : parsed.countdownAt;
  const bgMode: BgMode = parsed.bgMode ?? (bgImagePath ? "IMAGE" : "COLOR");

  return {
    mode: parsed.mode,
    messageSr: typeof parsed.messageSr === "undefined" ? null : parsed.messageSr,
    messageEn: typeof parsed.messageEn === "undefined" ? null : parsed.messageEn,
    messageRu: typeof parsed.messageRu === "undefined" ? null : parsed.messageRu,
    bgMode,
    bgImagePath,
    countdownAt,
    langs,
  };
}

function loadStateFromFile(): State {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    return parseStateFromJson(raw);
  } catch {
    return {
      mode: "NORMAL",
      messageSr: null,
      messageEn: null,
      messageRu: null,
      bgMode: "COLOR",
      bgImagePath: null,
      countdownAt: null,
      langs: {
        sr: {
          heading: null,
          subTitle: null,
          body: null,
          countdownLabel: null,
          footerNote: null,
          primary: { label: null, url: null, enabled: false },
          secondary: { label: null, url: null, enabled: false },
        },
        en: {
          heading: null,
          subTitle: null,
          body: null,
          countdownLabel: null,
          footerNote: null,
          primary: { label: null, url: null, enabled: false },
          secondary: { label: null, url: null, enabled: false },
        },
        ru: {
          heading: null,
          subTitle: null,
          body: null,
          countdownLabel: null,
          footerNote: null,
          primary: { label: null, url: null, enabled: false },
          secondary: { label: null, url: null, enabled: false },
        },
      },
    };
  }
}

async function loadStateFromBlob(): Promise<State> {
  const result = await get(STATE_BLOB_PATH, { access: "public" });
  if (!result || result.statusCode !== 200) throw new Error("missing-blob-state");

  // result.stream is a ReadableStream; convert to text via the Web Response API.
  const stream = result.stream as ReadableStream<Uint8Array>;
  const text = await new Response(stream).text();
  return parseStateFromJson(text);
}

function persist(next: State) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // best-effort; ignore write errors in dev
  }
}

export async function getMaintenanceState(): Promise<State> {
  if (canUseBlob) {
    try {
      return await loadStateFromBlob();
    } catch {
      // fallback to disk defaults (local dev)
    }
  }

  // Disk fallback (local dev)
  return loadStateFromFile();
}

export async function setMaintenanceState(update: Partial<State>) {
  const current = await getMaintenanceState();
  const next = { ...current, ...update };

  if (canUseBlob) {
    await put(STATE_BLOB_PATH, JSON.stringify(next), {
      access: "public",
      allowOverwrite: true,
    });
    return;
  }

  persist(next);
}


