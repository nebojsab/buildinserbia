"use client";

import type { getMaintenanceState } from "@/lib/maintenanceState";
import { useState } from "react";

type MaintenanceState = ReturnType<typeof getMaintenanceState>;
type MaintenanceStateResolved = Awaited<MaintenanceState>;

export function MaintenanceLangTabs({ status }: { status: MaintenanceStateResolved }) {
  const [active, setActive] = useState<"sr" | "en" | "ru">("sr");

  const tabs: { id: "sr" | "en" | "ru"; label: string }[] = [
    { id: "sr", label: "Srpski" },
    { id: "en", label: "English" },
    { id: "ru", label: "Русский" },
  ];

  return (
    <div>
      <div className="mtabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`mtab ${active === t.id ? "mtab--active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => {
        const l = t.id;
        const langBlock = status.langs[l];
        return (
          <div
            key={t.id}
            style={{
              display: active === t.id ? "grid" : "none",
              gap: 10,
              marginTop: 14,
            }}
          >
            <label style={{ display: "grid", gap: 4 }}>
              <span className="flabel">Naslov</span>
              <input
                name={`${l}Heading`}
                className="finput"
                defaultValue={langBlock.heading ?? ""}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="flabel">Podnaslov</span>
              <input
                name={`${l}SubTitle`}
                className="finput"
                defaultValue={langBlock.subTitle ?? ""}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="flabel">Tekst</span>
              <textarea
                name={`${l}Body`}
                defaultValue={langBlock.body ?? ""}
                style={{
                  minHeight: 64,
                  resize: "vertical",
                  padding: "8px 10px",
                  borderRadius: "var(--r)",
                  border: "1.5px solid var(--bdr)",
                  background: "var(--bg)",
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                }}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="flabel">Countdown label</span>
              <input
                name={`${l}CountdownLabel`}
                className="finput"
                defaultValue={langBlock.countdownLabel ?? ""}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="flabel">Footer note</span>
              <textarea
                name={`${l}FooterNote`}
                defaultValue={langBlock.footerNote ?? ""}
                style={{
                  minHeight: 56,
                  resize: "vertical",
                  padding: "8px 10px",
                  borderRadius: "var(--r)",
                  border: "1.5px solid var(--bdr)",
                  background: "var(--bg)",
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                }}
              />
            </label>
            <div
              style={{
                display: "grid",
                gap: 8,
                padding: "10px 12px",
                borderRadius: "var(--r)",
                border: "1px dashed var(--bdr)",
                background: "var(--bgw)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  fontFamily: "var(--sans)",
                  color: "var(--ink3)",
                }}
              >
                Primary dugme
              </p>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="flabel">Label</span>
                <input
                  name={`${l}PrimaryLabel`}
                  className="finput"
                  defaultValue={langBlock.primary.label ?? ""}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="flabel">URL</span>
                <input
                  name={`${l}PrimaryUrl`}
                  className="finput"
                  defaultValue={langBlock.primary.url ?? ""}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  name={`${l}PrimaryEnabled`}
                  defaultChecked={langBlock.primary.enabled}
                  style={{ width: 14, height: 14 }}
                />
                <span style={{ fontSize: 12, color: "var(--ink3)" }}>
                  Prikaži primary dugme
                </span>
              </label>
            </div>
            <div
              style={{
                display: "grid",
                gap: 8,
                padding: "10px 12px",
                borderRadius: "var(--r)",
                border: "1px dashed var(--bdr)",
                background: "var(--bgw)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  fontFamily: "var(--sans)",
                  color: "var(--ink3)",
                }}
              >
                Secondary dugme
              </p>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="flabel">Label</span>
                <input
                  name={`${l}SecondaryLabel`}
                  className="finput"
                  defaultValue={langBlock.secondary.label ?? ""}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="flabel">URL</span>
                <input
                  name={`${l}SecondaryUrl`}
                  className="finput"
                  defaultValue={langBlock.secondary.url ?? ""}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  name={`${l}SecondaryEnabled`}
                  defaultChecked={langBlock.secondary.enabled}
                  style={{ width: 14, height: 14 }}
                />
                <span style={{ fontSize: 12, color: "var(--ink3)" }}>
                  Prikaži secondary dugme
                </span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

