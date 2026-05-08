"use client";

import type { RoomField } from "../wizardTree/types";

export type RoomData = {
  naziv?: string;
  [key: string]: unknown;
};

type Props = {
  roomFields: RoomField[];
  maxRooms?: number;
  value: RoomData[];
  lang: "sr" | "en" | "ru";
  onChange: (rooms: RoomData[]) => void;
};

const ROOM_LABELS: Record<string, Record<"sr" | "en" | "ru", string>> = {
  sr: { sr: "Prostorija", en: "Room", ru: "Комната" },
  en: { sr: "Prostorija", en: "Room", ru: "Комната" },
};

const SUGGESTED_ROOMS: Record<"sr" | "en" | "ru", string[]> = {
  sr: ["Dnevna soba", "Spavaća soba", "Hodnik", "Trpezarija", "Kuhinja", "Kupatilo", "Radna soba", "Dečija soba"],
  en: ["Living room", "Bedroom", "Hallway", "Dining room", "Kitchen", "Bathroom", "Study", "Children's room"],
  ru: ["Гостиная", "Спальня", "Коридор", "Столовая", "Кухня", "Ванная", "Кабинет", "Детская"],
};

export function RoomListField({ roomFields, maxRooms = 10, value, lang, onChange }: Props) {
  const rooms = value.length > 0 ? value : [];
  const count = rooms.length;

  function setCount(n: number) {
    const next = [...rooms];
    while (next.length < n) next.push({});
    onChange(next.slice(0, n));
  }

  function updateRoom(idx: number, patch: Partial<RoomData>) {
    const next = rooms.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  }

  const countOptions = Array.from({ length: maxRooms }, (_, i) => i + 1);
  const suggestions = SUGGESTED_ROOMS[lang];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Room count picker */}
      <div>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink2)", marginBottom: 6 }}>
          {lang === "sr" ? "Broj prostorija" : lang === "ru" ? "Количество комнат" : "Number of rooms"}
          <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.04em", background: "var(--accbg)", color: "var(--acc)" }}>
            {lang === "sr" ? "OBAVEZNO" : lang === "ru" ? "ОБЯЗАТЕЛЬНО" : "REQUIRED"}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {countOptions.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                fontSize: "0.8125rem",
                fontWeight: 500,
                border: count === n ? "1.5px solid var(--acc)" : "1.5px solid var(--bdr)",
                background: count === n ? "var(--acc)" : "var(--card)",
                color: count === n ? "#fff" : "var(--ink2)",
                cursor: "pointer",
                transition: "all .12s",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Room blocks */}
      {rooms.map((room, idx) => (
        <div
          key={idx}
          style={{
            border: "1.5px solid var(--bdr)",
            borderRadius: "var(--r)",
            overflow: "hidden",
          }}
        >
          {/* Room header with name input */}
          <div style={{ background: "var(--bgw)", padding: "10px 14px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--ink3)", flexShrink: 0 }}>
              {idx + 1}.
            </span>
            <input
              className="finput"
              placeholder={suggestions[idx] ?? (lang === "sr" ? "Naziv prostorije (opciono)" : "Room name (optional)")}
              value={room.naziv ?? ""}
              onChange={(e) => updateRoom(idx, { naziv: e.target.value || undefined })}
              style={{ fontSize: "0.875rem", flex: 1 }}
            />
          </div>

          {/* Room fields */}
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {roomFields.map((rf) => (
              <div key={rf.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink2)" }}>
                    {rf.label[lang]}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    background: rf.importance === "required" ? "var(--accbg)" : "var(--bgw)",
                    color: rf.importance === "required" ? "var(--acc)" : "var(--ink4)",
                    border: rf.importance === "required" ? "none" : "1px solid var(--bdr)",
                  }}>
                    {rf.importance === "required"
                      ? (lang === "sr" ? "OBAVEZNO" : lang === "ru" ? "ОБЯЗАТЕЛЬНО" : "REQUIRED")
                      : (lang === "sr" ? "OPCIONO" : lang === "ru" ? "НЕОБЯЗАТЕЛЬНО" : "OPTIONAL")}
                  </span>
                </div>

                {/* select */}
                {rf.kind === "select" && rf.options && (
                  <select
                    className="fselect"
                    value={typeof room[rf.key] === "string" ? (room[rf.key] as string) : ""}
                    onChange={(e) => updateRoom(idx, { [rf.key]: e.target.value || undefined })}
                  >
                    <option value="">{lang === "sr" ? "— Izaberite —" : "— Select —"}</option>
                    {rf.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label[lang]}</option>
                    ))}
                  </select>
                )}

                {/* area */}
                {rf.kind === "area" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {rf.predefined && rf.predefined.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {rf.predefined.map((n) => {
                          const active = room[rf.key] === n;
                          return (
                            <button
                              key={n}
                              onClick={() => updateRoom(idx, { [rf.key]: active ? undefined : n })}
                              style={{
                                padding: "4px 11px", borderRadius: 100, fontSize: "0.8125rem",
                                fontWeight: 500, cursor: "pointer", transition: "all .12s",
                                border: active ? "1.5px solid var(--acc)" : "1.5px solid var(--bdr)",
                                background: active ? "var(--acc)" : "var(--card)",
                                color: active ? "#fff" : "var(--ink2)",
                              }}
                            >
                              {n} {rf.unit}
                            </button>
                          );
                        })}
                        {rf.unknownAllowed && (
                          <button
                            onClick={() => updateRoom(idx, { [rf.key]: room[rf.key] === "unknown" ? undefined : "unknown" })}
                            style={{
                              padding: "4px 11px", borderRadius: 100, fontSize: "0.8125rem",
                              fontWeight: 500, cursor: "pointer",
                              border: room[rf.key] === "unknown" ? "1.5px solid var(--ink3)" : "1.5px dashed var(--bdr2)",
                              background: room[rf.key] === "unknown" ? "var(--bgw)" : "transparent",
                              color: room[rf.key] === "unknown" ? "var(--ink2)" : "var(--ink4)",
                            }}
                          >
                            {lang === "sr" ? "Ne znam" : lang === "ru" ? "Не знаю" : "Don't know"}
                          </button>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        className="finput"
                        type="number"
                        min={0}
                        step={rf.kind === "area" ? 0.5 : 1}
                        placeholder={lang === "sr" ? "Unesi vrednost..." : "Enter value..."}
                        value={typeof room[rf.key] === "number" ? (room[rf.key] as number) : ""}
                        onChange={(e) => {
                          const n = parseFloat(e.target.value);
                          updateRoom(idx, { [rf.key]: isNaN(n) ? undefined : n });
                        }}
                        style={{ maxWidth: 120 }}
                        disabled={room[rf.key] === "unknown"}
                      />
                      {rf.unit && <span style={{ fontSize: "0.875rem", color: "var(--ink3)", fontWeight: 500 }}>{rf.unit}</span>}
                    </div>
                  </div>
                )}

                {/* toggle */}
                {rf.kind === "toggle" && (
                  <div className="wizard-toggle-group">
                    {([true, false] as const).map((bool) => {
                      const active = room[rf.key] === bool;
                      const isYes = bool === true;
                      return (
                        <button
                          key={String(bool)}
                          onClick={() => updateRoom(idx, { [rf.key]: active ? undefined : bool })}
                          className={`wizard-toggle-btn${active ? (isYes ? " wizard-toggle-yes" : " wizard-toggle-no") : ""}`}
                        >
                          {lang === "sr" ? (isYes ? "Da" : "Ne") : lang === "ru" ? (isYes ? "Да" : "Нет") : (isYes ? "Yes" : "No")}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* text */}
                {rf.kind === "text" && (
                  <input
                    className="finput"
                    placeholder={lang === "sr" ? "Unesi vrednost..." : "Enter value..."}
                    value={typeof room[rf.key] === "string" ? (room[rf.key] as string) : ""}
                    onChange={(e) => updateRoom(idx, { [rf.key]: e.target.value || undefined })}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
