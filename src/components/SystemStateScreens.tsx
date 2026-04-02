import type { MaintenancePayload } from "../api/maintenance";
import { SiteLogo } from "./SiteLogo";
import { useEffect, useState } from "react";
import { LangSwitch } from "./LangSwitch";
import type { Lang } from "../translations";

function Countdown({
  target,
  lang,
  countdownLabel,
}: {
  target: string;
  lang: Lang;
  countdownLabel?: string | null;
}) {
  const [leftMs, setLeftMs] = useState(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setLeftMs(new Date(target).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || Number.isNaN(Date.parse(target)) || leftMs <= 0) return null;

  const totalSec = Math.floor(leftMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const label =
    countdownLabel ??
    (lang === "sr"
      ? "Do pokretanja je ostalo"
      : lang === "en"
        ? "Time until launch"
        : "До запуска осталось");

  return (
    <div
      style={{
        marginBottom: 14,
        padding: "7px 12px",
        borderRadius: 999,
        background: "var(--ambbg)",
        border: "1px solid var(--ambmid)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        fontFamily: "var(--sans)",
        color: "var(--amb)",
      }}
    >
      <span>⏱</span>
      <span>{label}:</span>
      <strong style={{ fontWeight: 600 }}>
        {days}d {hours}h {mins}m {secs}s
      </strong>
    </div>
  );
}

export function ComingSoonScreen({
  lang,
  status,
  setLang,
}: {
  lang: Lang;
  status: MaintenancePayload | null;
  setLang: (l: Lang) => void;
}) {
  const title =
    lang === "sr"
      ? "BuildInSerbia uskoro"
      : lang === "en"
        ? "BuildInSerbia is coming soon"
        : "BuildInSerbia скоро запускается";
  const sub =
    lang === "sr"
      ? "Radimo na alatu za planiranje gradnje i renoviranja. Uskoro ćemo otvoriti pristup javnoj beta verziji."
      : lang === "en"
        ? "We’re preparing a planning tool for building and renovation projects in Serbia. Public beta is coming soon."
        : "Мы готовим инструмент для планирования строительства и ремонта в Сербии. Публичная бета скоро будет доступна.";

  const langBlock = status?.langs?.[lang];
  const heading = langBlock?.heading || title;
  const subTitle = langBlock?.subTitle || null;
  const countdownLabel = langBlock?.countdownLabel ?? null;
  const legacyBody =
    lang === "sr" ? status?.messageSr : lang === "en" ? status?.messageEn : status?.messageRu;
  const bodyText = langBlock?.body || legacyBody || sub;

  const bgStyle =
    status?.bgMode === "IMAGE" && status?.bgImagePath
      ? {
          backgroundImage: `url(${status.bgImagePath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: "var(--bg)" };

  const footerText =
    langBlock?.footerNote ??
    (lang === "sr"
      ? "Za pitanja i dodatne informacije, pišite nam na hello@buildinserbia.com."
      : lang === "en"
        ? "For questions and additional information, contact us at hello@buildinserbia.com."
        : "По вопросам и за дополнительной информацией, напишите нам на hello@buildinserbia.com.");

  const renderFooterWithMailto = (text: string) => {
    const email = "hello@buildinserbia.com";
    if (!text.includes(email)) return text;

    const parts = text.split(email);
    return (
      <>
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 ? (
              <a
                href={`mailto:${email}`}
                style={{ textDecoration: "underline", color: "var(--ink4)" }}
              >
                {email}
              </a>
            ) : null}
          </span>
        ))}
      </>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        ...bgStyle,
      }}
    >
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: "26px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SiteLogo compact />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--acc)",
                fontFamily: "var(--sans)",
              }}
            >
              Coming soon
            </span>
          </div>
          <div style={{ marginTop: 2 }}>
            <LangSwitch lang={lang} setLang={setLang} />
          </div>
        </div>
        {status?.countdownAt && <Countdown target={status.countdownAt} lang={lang} countdownLabel={countdownLabel} />}
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 500, color: "var(--ink)", marginBottom: 6, lineHeight: 1.3 }}>
          {heading}
        </h1>
        {subTitle && (
          <p
            style={{
              fontSize: 13,
              color: "var(--ink3)",
              lineHeight: 1.6,
              fontFamily: "var(--sans)",
              marginBottom: 8,
            }}
          >
            {subTitle}
          </p>
        )}
        <p style={{ fontSize: 14, color: "var(--ink3)", lineHeight: 1.7, fontFamily: "var(--sans)", marginBottom: 18 }}>
          {bodyText}
        </p>
        {(langBlock?.primary.enabled && langBlock.primary.label && langBlock.primary.url) ||
        (langBlock?.secondary.enabled && langBlock.secondary.label && langBlock.secondary.url) ? (
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {langBlock?.primary.enabled && langBlock.primary.label && langBlock.primary.url && (
              <a href={langBlock.primary.url} className="btn-p">
                {langBlock.primary.label}
              </a>
            )}
            {langBlock?.secondary.enabled && langBlock.secondary.label && langBlock.secondary.url && (
              <a
                href={langBlock.secondary.url}
                className="btn-g"
                style={{ textDecoration: "none" }}
              >
                {langBlock.secondary.label}
              </a>
            )}
          </div>
        ) : null}
        <p style={{ fontSize: 12, color: "var(--ink4)", fontFamily: "var(--sans)" }}>
          {renderFooterWithMailto(footerText)}
        </p>
      </div>
    </div>
  );
}

export function MaintenanceScreen({
  lang,
  status,
  setLang,
}: {
  lang: Lang;
  status: MaintenancePayload | null;
  setLang: (l: Lang) => void;
}) {
  const defaultMsg =
    lang === "sr"
      ? "Sajt je trenutno u održavanju. Pokušajte ponovo za nekoliko minuta."
      : lang === "en"
        ? "The site is currently under maintenance. Please try again in a few minutes."
        : "Сайт сейчас на обслуживании. Попробуйте ещё раз через несколько минут.";

  const body = status && (lang === "sr" ? status.messageSr : lang === "en" ? status.messageEn : status.messageRu) || defaultMsg;

  const langBlock = status?.langs?.[lang];
  const heading =
    langBlock?.heading ||
    (lang === "sr"
      ? "Trenutno održavanje"
      : lang === "en"
        ? "Scheduled maintenance"
        : "Техническое обслуживание");
  const subTitle = langBlock?.subTitle || null;
  const bodyText = langBlock?.body || body;
  const countdownLabel = langBlock?.countdownLabel ?? null;

  const bgStyle =
    status?.bgMode === "IMAGE" && status?.bgImagePath
      ? {
          backgroundImage: `url(${status.bgImagePath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: "var(--bg)" };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        ...bgStyle,
      }}
    >
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: "26px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SiteLogo compact />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--amb)",
                fontFamily: "var(--sans)",
              }}
            >
              Maintenance
            </span>
          </div>
          <div style={{ marginTop: 2 }}>
            <LangSwitch lang={lang} setLang={setLang} />
          </div>
        </div>
        {status?.countdownAt && <Countdown target={status.countdownAt} lang={lang} countdownLabel={countdownLabel} />}
        <h1 style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 500, color: "var(--ink)", marginBottom: 6, lineHeight: 1.3 }}>
          {heading}
        </h1>
        {subTitle && (
          <p
            style={{
              fontSize: 13,
              color: "var(--ink3)",
              lineHeight: 1.6,
              fontFamily: "var(--sans)",
              marginBottom: 8,
            }}
          >
            {subTitle}
          </p>
        )}
        <p style={{ fontSize: 14, color: "var(--ink3)", lineHeight: 1.7, fontFamily: "var(--sans)", marginBottom: 18 }}>
          {bodyText}
        </p>
        {(langBlock?.primary.enabled && langBlock.primary.label && langBlock.primary.url) ||
        (langBlock?.secondary.enabled && langBlock.secondary.label && langBlock.secondary.url) ? (
          <div style={{ display: "flex", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            {langBlock?.primary.enabled && langBlock.primary.label && langBlock.primary.url && (
              <a href={langBlock.primary.url} className="btn-p">
                {langBlock.primary.label}
              </a>
            )}
            {langBlock?.secondary.enabled && langBlock.secondary.label && langBlock.secondary.url && (
              <a
                href={langBlock.secondary.url}
                className="btn-g"
                style={{ textDecoration: "none" }}
              >
                {langBlock.secondary.label}
              </a>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

