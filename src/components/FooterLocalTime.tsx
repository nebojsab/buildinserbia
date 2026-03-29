import { useEffect, useState } from "react";
import type { Lang } from "../translations";

const localeByLang: Record<Lang, string> = {
  sr: "sr-Latn-RS",
  en: "en-GB",
  ru: "ru-RU",
};

/** Sat, minut, sekunda + kratki naziv zone i IANA identifikator (npr. Europe/Belgrade). */
export function FooterLocalTime({ lang, label }: { lang: Lang; label: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const loc = localeByLang[lang];
  const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const time = new Intl.DateTimeFormat(loc, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const tzShort =
    new Intl.DateTimeFormat(loc, { timeZoneName: "short" }).formatToParts(now).find((p) => p.type === "timeZoneName")
      ?.value ?? "";

  return (
    <p style={{ fontSize: 11, color: "var(--ink4)", fontFamily: "var(--sans)", marginTop: 6, lineHeight: 1.45 }}>
      <span style={{ opacity: 0.9 }}>{label}: </span>
      <time dateTime={now.toISOString()} style={{ fontVariantNumeric: "tabular-nums" }}>
        {time}
        {tzShort ? ` · ${tzShort}` : ""} ({iana})
      </time>
    </p>
  );
}
