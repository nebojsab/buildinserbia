import type { WizardLocation, ZoneType } from "./wizardState";
import type { WizardI18n } from "./wizardI18n";
import { LocationAutocomplete } from "@shared/components/LocationAutocomplete";
import type { Lang } from "@shared/translations";

type Props = {
  lang: string;
  location: WizardLocation | null;
  onChange: (loc: WizardLocation) => void;
  i18n: WizardI18n;
};

const zoneValues: ZoneType[] = ["gradska", "prigradska", "seoska"];

export function Step1Location({ lang, location, onChange, i18n }: Props) {
  const municipality = location?.municipality ?? "";
  const zoneType = location?.zoneType ?? null;

  const uiLang: Lang = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";

  function update(partial: Partial<WizardLocation>) {
    onChange({
      municipality: location?.municipality ?? "",
      zoneType: location?.zoneType ?? null,
      ...partial,
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)" }}>
          {i18n.step1Title}
        </h2>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink3)" }}>{i18n.step1Sub}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--ink2)", marginBottom: 6 }}>
            {i18n.municipalityLabel}
          </label>
          <LocationAutocomplete
            value={municipality}
            onChange={(v) => update({ municipality: v })}
            placeholder={i18n.municipalityPlaceholder as string}
            lang={uiLang}
            labels={{
              loading: i18n.locationLoading as string,
              noResults: i18n.locationNoResults as string,
              osmAttr: i18n.locationOsmAttr as string,
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--ink2)", marginBottom: 10 }}>
            {i18n.zoneLabel}
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {zoneValues.map((zone, idx) => {
              const active = zoneType === zone;
              return (
                <button
                  key={zone}
                  onClick={() => update({ zoneType: zone })}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 100,
                    border: active ? "2px solid var(--acc)" : "2px solid var(--bdr)",
                    background: active ? "var(--acc)" : "var(--card)",
                    color: active ? "#fff" : "var(--ink)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {i18n.zones[idx]}
                </button>
              );
            })}
          </div>
        </div>

        {municipality.trim().length > 0 && zoneType && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--grnbg)", border: "1px solid var(--grnmid)", borderRadius: "var(--r)", fontSize: "0.875rem", color: "var(--grn)", fontWeight: 500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {municipality} · {i18n.zones[zoneValues.indexOf(zoneType)]}
          </div>
        )}
      </div>
    </div>
  );
}
