import { wizardTrees } from "../wizardTree";
import type { WizardI18n } from "./wizardI18n";
import { WizardIcon } from "./WizardIcon";

type Props = {
  lang: string;
  selected: string | null;
  onSelect: (id: string) => void;
  i18n: WizardI18n;
};

const projectMeta: Record<
  string,
  { icon: string; desc: { sr: string; en: string; ru: string }; color: string }
> = {
  reno: {
    icon: "paintbrush",
    color: "#134279",
    desc: {
      sr: "Renovacija kupatila, podova, fasade, instalacija i više.",
      en: "Bathroom, flooring, facade, installations and more.",
      ru: "Ремонт ванной, полов, фасада, коммуникаций и многое другое.",
    },
  },
  newbuild: {
    icon: "building",
    color: "#134279",
    desc: {
      sr: "Izgradnja porodične kuće, vikendice ili poslovnog objekta od temelja.",
      en: "Build a family house, cottage or commercial building from scratch.",
      ru: "Строительство частного дома, дачи или коммерческого объекта с нуля.",
    },
  },
  extension: {
    icon: "home",
    color: "#166534",
    desc: {
      sr: "Horizontalna dogradnja, nadogradnja sprata ili adaptacija potkrovlja.",
      en: "Horizontal extension, add a storey or convert a loft.",
      ru: "Горизонтальная пристройка, надстройка этажа или переоборудование мансарды.",
    },
  },
  yard: {
    icon: "leaf",
    color: "#92400E",
    desc: {
      sr: "Uređenje dvorišta — ograde, terase, zelene površine, bazen i više.",
      en: "Garden landscaping — fencing, terraces, lawn, pool and more.",
      ru: "Благоустройство двора — заборы, террасы, газон, бассейн и многое другое.",
    },
  },
};

const order = ["reno", "newbuild", "extension", "yard"];

export function Step0ProjectType({ lang, selected, onSelect, i18n }: Props) {
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontFamily: "var(--heading)", fontWeight: 700, color: "var(--ink)" }}>
          {i18n.step0Title}
        </h2>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink3)" }}>{i18n.step0Sub}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {order.map((id) => {
          const tree = wizardTrees[id];
          if (!tree) return null;
          const meta = projectMeta[id];
          const isSelected = selected === id;

          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              style={{
                border: isSelected
                  ? `2px solid ${meta.color}`
                  : "2px solid var(--bdr)",
                borderRadius: "var(--rl)",
                padding: "18px 16px",
                cursor: "pointer",
                background: isSelected ? `${meta.color}0f` : "var(--card)",
                transition: "all .15s",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                textAlign: "left",
                width: "100%",
                boxShadow: isSelected ? `0 0 0 1px ${meta.color} inset` : "none",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--r)",
                  background: isSelected ? meta.color : `${meta.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isSelected ? "#fff" : meta.color,
                }}
              >
                <WizardIcon name={meta.icon} size={20} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: 4,
                    fontFamily: "var(--heading)",
                  }}
                >
                  {tree.label[l]}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--ink3)", lineHeight: 1.4 }}>
                  {meta.desc[l]}
                </div>
              </div>
              <div
                style={{
                  marginTop: "auto",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: isSelected ? `2px solid ${meta.color}` : "2px solid var(--bdr2)",
                  background: isSelected ? meta.color : "transparent",
                  alignSelf: "flex-end",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#fff",
                }}
              >
                {isSelected && "✓"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
