"use client";

import type { getMaintenanceState } from "@/lib/maintenanceState";
import { useEffect, useMemo, useRef, useState } from "react";
import { MaintenanceLangTabs } from "./MaintenanceLangTabs";
import { DEFAULT_LANGS } from "./maintenanceDefaults";

type MaintenanceState = ReturnType<typeof getMaintenanceState>;
type MaintenanceStateResolved = Awaited<MaintenanceState>;

const MODE_OPTIONS: { value: MaintenanceStateResolved["mode"]; label: string; desc: string }[] = [
  { value: "NORMAL", label: "Normalno", desc: "Sajt radi u punom kapacitetu." },
  { value: "COMING_SOON", label: "Coming soon", desc: "Prikazuje coming-soon ekran umesto plana." },
  { value: "MAINTENANCE", label: "Maintenance", desc: "Privremeno nedostupan – radovi ili deploy." },
  { value: "READ_ONLY", label: "Read-only", desc: "Sajt radi, ali onemogućeni su novi upiti / forme." },
];

export function MaintenanceAdminPanel({
  status,
  saved,
}: {
  status: MaintenanceStateResolved;
  saved: boolean;
}) {
  const [mode, setMode] = useState<MaintenanceStateResolved["mode"]>(status.mode);
  const [bgMode, setBgMode] = useState<MaintenanceStateResolved["bgMode"]>(status.bgMode);
  const [removeBgImage, setRemoveBgImage] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [toastText, setToastText] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const initialSnapshotRef = useRef<string>("");

  // Sync after save/reset navigation so UI matches the persisted state.
  useEffect(() => {
    setMode(status.mode);
    setBgMode(status.bgMode);
    setRemoveBgImage(false);
  }, [status.mode, status.bgMode]);

  const normalizeText = (v: string | null | undefined) => {
    const s = (v ?? "").toString();
    const t = s.trim();
    return t.length === 0 ? null : t;
  };

  const toDatetimeLocalIso = (datetimeLocal: string | null) => {
    const raw = datetimeLocal ?? "";
    if (!raw) return null;
    if (Number.isNaN(Date.parse(raw))) return null;
    // Must match server parsing of datetime-local string.
    return new Date(raw).toISOString();
  };

  const buildSnapshotFromStatus = (st: MaintenanceStateResolved) => {
    if (st.mode !== "COMING_SOON") return JSON.stringify({ mode: st.mode });

    const effectiveBgMode: MaintenanceStateResolved["bgMode"] = st.bgMode;
    const bgImageToken = effectiveBgMode === "IMAGE" ? st.bgImagePath : null;

    return JSON.stringify({
      mode: st.mode,
      effectiveBgMode,
      countdownAt: st.countdownAt,
      bgImageToken,
      langs: {
        sr: st.langs.sr,
        en: st.langs.en,
        ru: st.langs.ru,
      },
    });
  };

  const buildSnapshotFromForm = () => {
    const form = document.getElementById("maintenance-form") as HTMLFormElement | null;
    if (!form) return buildSnapshotFromStatus(status);
    const fd = new FormData(form);

    const modeForm = (fd.get("mode")?.toString() || status.mode) as MaintenanceStateResolved["mode"];
    if (modeForm !== "COMING_SOON") return JSON.stringify({ mode: modeForm });

    const remove = fd.get("removeBgImage") === "on";
    const bgModeRaw = fd.get("bgMode")?.toString() || status.bgMode;
    const effectiveBgMode: MaintenanceStateResolved["bgMode"] = remove ? "COLOR" : bgModeRaw === "IMAGE" ? "IMAGE" : "COLOR";

    const countdownAt = toDatetimeLocalIso(fd.get("countdownAt")?.toString() || null);

    let bgImageToken: string | null = null;
    if (effectiveBgMode === "IMAGE" && !remove) {
      const bgInput = form.elements.namedItem("bgImage") as HTMLInputElement | null;
      if (bgInput?.files && bgInput.files.length > 0) {
        const f = bgInput.files[0];
        bgImageToken = `${f.name}:${f.size}`;
      } else {
        bgImageToken = status.bgImagePath;
      }
    }

    const langKeys = ["sr", "en", "ru"] as const;
    type Lang = (typeof langKeys)[number];

    const buildLangBlock = (l: Lang) => {
      const heading = normalizeText(fd.get(`${l}Heading`)?.toString() || null);
      const subTitle = normalizeText(fd.get(`${l}SubTitle`)?.toString() || null);
      const body = normalizeText(fd.get(`${l}Body`)?.toString() || null);
      const countdownLabel = normalizeText(fd.get(`${l}CountdownLabel`)?.toString() || null);
      const footerNote = normalizeText(fd.get(`${l}FooterNote`)?.toString() || null);
      const primaryEnabled = fd.get(`${l}PrimaryEnabled`) === "on";
      const primaryLabel = normalizeText(fd.get(`${l}PrimaryLabel`)?.toString() || null);
      const primaryUrl = normalizeText(fd.get(`${l}PrimaryUrl`)?.toString() || null);
      const secondaryEnabled = fd.get(`${l}SecondaryEnabled`) === "on";
      const secondaryLabel = normalizeText(fd.get(`${l}SecondaryLabel`)?.toString() || null);
      const secondaryUrl = normalizeText(fd.get(`${l}SecondaryUrl`)?.toString() || null);

      return {
        heading,
        subTitle,
        body,
        countdownLabel,
        footerNote,
        primary: { enabled: primaryEnabled, label: primaryLabel, url: primaryUrl },
        secondary: { enabled: secondaryEnabled, label: secondaryLabel, url: secondaryUrl },
      };
    };

    const langs = {
      sr: buildLangBlock("sr"),
      en: buildLangBlock("en"),
      ru: buildLangBlock("ru"),
    };

    return JSON.stringify({
      mode: modeForm,
      effectiveBgMode,
      countdownAt,
      bgImageToken,
      langs,
    });
  };

  useEffect(() => {
    initialSnapshotRef.current = buildSnapshotFromStatus(status);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const form = document.getElementById("maintenance-form") as HTMLFormElement | null;
    if (!form) return;

    const recompute = () => {
      const next = buildSnapshotFromForm();
      // Ako se promeni samo `mode`, to mora da se vidi kao dirty.
      // Snapshot metoda može da propusti neke slučajeve kad se polja uslovo renderuju.
      const modeDirty = mode !== status.mode;
      setDirty(modeDirty || next !== initialSnapshotRef.current);
    };

    form.addEventListener("input", recompute);
    form.addEventListener("change", recompute);
    // compute once after mount/render
    recompute();

    return () => {
      form.removeEventListener("input", recompute);
      form.removeEventListener("change", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, status.mode, status.bgMode, status.countdownAt, mode, bgMode, removeBgImage]);

  useEffect(() => {
    if (!saved) return;
    setToastText("Podešavanja su sačuvana. Osveži javni sajt na `/` da vidiš promenu.");
    const id = window.setTimeout(() => setToastText(null), 7000);
    return () => window.clearTimeout(id);
  }, [saved]);

  const showResetToast = () => {
    setToastText("Podesavanja su resetovana.");
    window.setTimeout(() => setToastText(null), 6000);
  };

  const resetFormToDefaults = () => {
    const form = document.getElementById("maintenance-form") as HTMLFormElement | null;
    if (!form) return;

    const langKeys = ["sr", "en", "ru"] as const;

    const setByNameValue = (name: string, value: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!el) return;
      // Inputs/textarea are safe to set via `.value`
      (el as HTMLInputElement | HTMLTextAreaElement).value = value;
    };

    // mode radio (reset mora da se vrati na trenutno sačuvan `status.mode`)
    form.querySelectorAll<HTMLInputElement>('input[type="radio"][name="mode"]').forEach((r) => {
      r.checked = r.value === status.mode;
    });

    // countdown
    const countdownLocalValue = "";
    setByNameValue("countdownAt", countdownLocalValue);

    // bgMode radios
    form.querySelectorAll<HTMLInputElement>('input[type="radio"][name="bgMode"]').forEach((r) => {
      r.checked = r.value === "COLOR";
    });
    const removeChk = form.elements.namedItem("removeBgImage") as HTMLInputElement | null;
    if (removeChk) removeChk.checked = false;

    // clear file input so we don't accidentally re-upload
    const fileInput = form.elements.namedItem("bgImage") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";

    // language blocks
    for (const l of langKeys) {
      const b = DEFAULT_LANGS[l];

      setByNameValue(`${l}Heading`, b.heading ?? "");
      setByNameValue(`${l}SubTitle`, b.subTitle ?? "");
      setByNameValue(`${l}Body`, b.body ?? "");
      setByNameValue(`${l}CountdownLabel`, b.countdownLabel ?? "");
      setByNameValue(`${l}FooterNote`, b.footerNote ?? "");

      const pEnabled = form.elements.namedItem(`${l}PrimaryEnabled`) as HTMLInputElement | null;
      if (pEnabled) pEnabled.checked = b.primary.enabled;
      setByNameValue(`${l}PrimaryLabel`, b.primary.label ?? "");
      setByNameValue(`${l}PrimaryUrl`, b.primary.url ?? "");

      const sEnabled = form.elements.namedItem(`${l}SecondaryEnabled`) as HTMLInputElement | null;
      if (sEnabled) sEnabled.checked = b.secondary.enabled;
      setByNameValue(`${l}SecondaryLabel`, b.secondary.label ?? "");
      setByNameValue(`${l}SecondaryUrl`, b.secondary.url ?? "");
    }
  };

  const countdownDefault = useMemo(() => {
    return status.countdownAt ? new Date(status.countdownAt).toISOString().slice(0, 16) : "";
  }, [status.countdownAt]);

  return (
    <>
      <input type="hidden" name="resetAll" value="0" />
      {toastText && <div className="toast-success">{toastText}</div>}
      <div>
        <div style={{ marginBottom: 18 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            Prikaz
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MODE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}
              >
                <input
                  type="radio"
                  name="mode"
                  value={opt.value}
                  checked={mode === opt.value}
                  onChange={() => setMode(opt.value)}
                  style={{ marginTop: 3 }}
                />
                <span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{opt.label}</span>
                  <br />
                  <span style={{ fontSize: 12, color: "var(--ink3)" }}>{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {mode === "COMING_SOON" && (
          <div key={resetKey} style={{ marginTop: 18 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Pozadinska slika i odbrojavanje
            </p>

            <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="bgMode"
                    value="COLOR"
                    checked={bgMode === "COLOR"}
                    onChange={() => setBgMode("COLOR")}
                  />
                  <span style={{ fontSize: 12, color: "var(--ink3)" }}>Solid color (bela pozadina)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="bgMode"
                    value="IMAGE"
                    checked={bgMode === "IMAGE"}
                    onChange={() => setBgMode("IMAGE")}
                  />
                  <span style={{ fontSize: 12, color: "var(--ink3)" }}>Slika</span>
                </label>
              </div>

              {bgMode === "IMAGE" && (
                <>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span className="flabel">Upload pozadinske slike (opciono)</span>
                    <input type="file" name="bgImage" accept="image/*" />
                    {status.bgImagePath && (
                      <span style={{ fontSize: 11, color: "var(--ink4)" }}>
                        Trenutno: {status.bgImagePath}
                      </span>
                    )}
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      name="removeBgImage"
                      checked={removeBgImage}
                      onChange={() => setRemoveBgImage((v) => !v)}
                    />
                    <span style={{ fontSize: 12, color: "var(--ink3)" }}>Ukloni postojeću sliku</span>
                  </label>
                </>
              )}

              {bgMode === "COLOR" && (
                <label style={{ display: "grid", gap: 4 }}>
                  <span className="flabel">Solid background</span>
                  <div style={{ fontSize: 12, color: "var(--ink4)", lineHeight: 1.5 }}>
                    Ne koristi se image pozadina.
                  </div>
                </label>
              )}

              <label style={{ display: "grid", gap: 4 }}>
                <span className="flabel">Odbrojavanje do datuma/vremena</span>
                <input type="datetime-local" name="countdownAt" className="finput" defaultValue={countdownDefault} />
                <span style={{ fontSize: 11, color: "var(--ink4)" }}>
                  Ako je prazno, countdown se ne prikazuje.
                </span>
              </label>
            </div>

            <div style={{ marginTop: 22 }}>
              <MaintenanceLangTabs status={status} />
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: "rgba(250,250,249,.94)",
          borderTop: "1px solid var(--bdr)",
          backdropFilter: "blur(10px)",
          padding: "12px 0",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ minHeight: 18 }}>
            {saved ? (
              <span style={{ fontSize: 12, fontFamily: "var(--sans)", color: "var(--grn)" }}>Sačuvano.</span>
            ) : (
              <span style={{ fontSize: 12, fontFamily: "var(--sans)", color: "transparent" }}>.</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            <button
              type="button"
              className="btn-g"
              disabled={!dirty}
              onClick={() => {
                // Ne radimo remount (resetKey) jer inputi imaju `defaultValue` / `defaultChecked`:
                // remount bi ih vratio na `status` vrednosti umesto na default (trojezicne) vrednosti.
                // Pošto su `mode` radio dugmad kontrolisana React-ovim state-om, prvo uskladimo UI sa `status.mode`.
                setMode(status.mode);
                setBgMode("COLOR");
                setRemoveBgImage(false);
                showResetToast();
                resetFormToDefaults();
                // Resetujemo i persisted state tako da javni sajt odmah ide na default.
                // Pošto je ovo reset, podnosimo formu sa reset vrednostima.
                setDirty(false);
                window.setTimeout(() => {
                  const formEl = document.getElementById("maintenance-form") as HTMLFormElement | null;
                  const resetAllEl = formEl?.querySelector('input[name="resetAll"]') as HTMLInputElement | null;
                  if (resetAllEl) resetAllEl.value = "1";
                  formEl?.requestSubmit();
                }, 0);
              }}
            >
              Resetuj
            </button>
            <button
              type="submit"
              className="btn-p"
              disabled={!dirty}
              onClick={() => {
                setToastText("Sačuvavam podešavanja...");
                window.setTimeout(() => setToastText(null), 2500);
              }}
            >
              Sačuvaj
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

