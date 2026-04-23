import type { Lang } from "../translations";

export type PlannerTaskType =
  | "winreplace"
  | "bathreno"
  | "ufh"
  | "flooring"
  | "electrical"
  | "plumbing"
  | "insulation"
  | "fullreno";

export type EstimateMode = "exact" | "rough";
export type FieldImportance = "required" | "optional" | "niceToHave";
export type FieldKind = "number" | "text" | "toggle" | "select" | "chips";

export type LocalizedText = Record<Lang, string>;

export type TaskFieldOption = {
  value: string;
  label: LocalizedText;
};

export type TaskFieldConfig = {
  key: string;
  kind: FieldKind;
  importance: FieldImportance;
  label: LocalizedText;
  help?: LocalizedText;
  placeholder?: LocalizedText;
  unknownAllowed?: boolean;
  options?: TaskFieldOption[];
};

export type TaskSectionConfig = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  fields: TaskFieldConfig[];
};

export type TaskFormConfig = {
  task: PlannerTaskType;
  title: LocalizedText;
  summary: LocalizedText;
  requiresTotalArea: boolean;
  sections: TaskSectionConfig[];
};

export type CommonProjectFieldConfig = {
  key: string;
  kind: FieldKind;
  label: LocalizedText;
  importance: FieldImportance;
  visibleWhen: "always" | "needsTotalArea";
  options?: TaskFieldOption[];
  placeholder?: LocalizedText;
};

export const COMMON_PROJECT_FIELDS: CommonProjectFieldConfig[] = [
  {
    key: "propertyType",
    kind: "select",
    label: {
      sr: "Tip objekta",
      en: "Property type",
      ru: "Tip obekta",
    },
    importance: "required",
    visibleWhen: "always",
    options: [
      {
        value: "apartment",
        label: { sr: "Stan", en: "Apartment", ru: "Kvartira" },
      },
      {
        value: "house",
        label: { sr: "Kuca", en: "House", ru: "Dom" },
      },
    ],
  },
  {
    key: "totalPropertyAreaM2",
    kind: "number",
    label: {
      sr: "Ukupna kvadratura objekta (m2)",
      en: "Total property area (m2)",
      ru: "Obshchaya ploshchad obekta (m2)",
    },
    importance: "required",
    visibleWhen: "needsTotalArea",
    placeholder: {
      sr: "npr. 85",
      en: "e.g. 85",
      ru: "naprimer, 85",
    },
  },
  {
    key: "budgetBand",
    kind: "select",
    label: {
      sr: "Okvirni budzet",
      en: "Approximate budget",
      ru: "Primerniy byudzhet",
    },
    importance: "optional",
    visibleWhen: "always",
    options: [
      { value: "low", label: { sr: "Nizi", en: "Lower", ru: "Nizkiy" } },
      { value: "mid", label: { sr: "Srednji", en: "Middle", ru: "Sredniy" } },
      { value: "high", label: { sr: "Visi", en: "Higher", ru: "Vysokiy" } },
    ],
  },
];

export const TASK_FORM_CONFIG: Record<PlannerTaskType, TaskFormConfig> = {
  winreplace: {
    task: "winreplace",
    title: {
      sr: "Zamena prozora",
      en: "Window replacement",
      ru: "Zamena okon",
    },
    summary: {
      sr: "Bitni su broj otvora, dimenzije i tip stolarije.",
      en: "Openings count, dimensions, and frame type matter most.",
      ru: "Vazhny kolichestvo proemov, razmeri i tip okon.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "scope",
        title: { sr: "Obim", en: "Scope", ru: "Obem" },
        description: {
          sr: "Unesi minimum za procenu troska po komadu/m2.",
          en: "Enter minimum inputs for per-unit estimate.",
          ru: "Vvedite minimum dlya otsenki po shtukam/m2.",
        },
        fields: [
          {
            key: "openingsCount",
            kind: "number",
            importance: "optional",
            label: {
              sr: "Broj otvora",
              en: "Number of openings",
              ru: "Kolichestvo proemov",
            },
          },
          {
            key: "openingDimensions",
            kind: "text",
            importance: "optional",
            unknownAllowed: true,
            label: {
              sr: "Dimenzije otvora (SxV)",
              en: "Opening dimensions (WxH)",
              ru: "Razmery proemov (ShxV)",
            },
            help: {
              sr: "Mozes prosecnu dimenziju ako ne znas svaki otvor.",
              en: "Use average size if exact per-opening is unknown.",
              ru: "Ispolzuyte sredniy razmer, esli tochnye neizvestny.",
            },
          },
          {
            key: "frameMaterial",
            kind: "select",
            importance: "required",
            label: {
              sr: "Materijal stolarije",
              en: "Frame material",
              ru: "Material ram",
            },
            options: [
              { value: "pvc", label: { sr: "PVC", en: "PVC", ru: "PVC" } },
              { value: "alu", label: { sr: "ALU", en: "ALU", ru: "ALU" } },
              { value: "wood", label: { sr: "Drvo", en: "Wood", ru: "Derevo" } },
            ],
          },
          {
            key: "glassType",
            kind: "select",
            importance: "required",
            label: {
              sr: "Tip stakla",
              en: "Glazing type",
              ru: "Tip stekla",
            },
            options: [
              { value: "double", label: { sr: "Dvoslojno", en: "Double glazing", ru: "Dvoynoe" } },
              { value: "triple", label: { sr: "Troslojno", en: "Triple glazing", ru: "Troynoe" } },
              { value: "lowe", label: { sr: "Low-E", en: "Low-E", ru: "Low-E" } },
            ],
          },
          {
            key: "profileClass",
            kind: "select",
            importance: "optional",
            label: {
              sr: "Klasa profila",
              en: "Profile class",
              ru: "Klass profilya",
            },
            options: [
              { value: "standard", label: { sr: "Standard", en: "Standard", ru: "Standart" } },
              { value: "premium", label: { sr: "Premium", en: "Premium", ru: "Premium" } },
            ],
          },
          {
            key: "hardwareLevel",
            kind: "select",
            importance: "optional",
            label: {
              sr: "Nivo okova",
              en: "Hardware level",
              ru: "Uroven furnitury",
            },
            options: [
              { value: "basic", label: { sr: "Osnovni", en: "Basic", ru: "Bazovyy" } },
              { value: "premium", label: { sr: "Premium", en: "Premium", ru: "Premium" } },
              { value: "security", label: { sr: "Sigurnosni", en: "Security", ru: "Zashchitnyy" } },
            ],
          },
          {
            key: "includeFinishing",
            kind: "toggle",
            importance: "optional",
            label: {
              sr: "Ukljuci pratece radove (spaletne, silikon, obrada)",
              en: "Include finishing works",
              ru: "Vklyuchit soputstvuyushchie raboty",
            },
          },
          {
            key: "includeRollerShutters",
            kind: "toggle",
            importance: "optional",
            label: {
              sr: "Ukljuci roletne",
              en: "Include roller shutters",
              ru: "Vklyuchit rolety",
            },
          },
          {
            key: "includeMosquitoNets",
            kind: "toggle",
            importance: "optional",
            label: {
              sr: "Ukljuci komarnike",
              en: "Include mosquito nets",
              ru: "Vklyuchit moskitnye setki",
            },
          },
        ],
      },
    ],
  },
  bathreno: {
    task: "bathreno",
    title: {
      sr: "Renoviranje kupatila",
      en: "Bathroom renovation",
      ru: "Remont vannoy",
    },
    summary: {
      sr: "Najbitniji su pod/zid m2 i nivo renoviranja.",
      en: "Floor/wall area and renovation level are key inputs.",
      ru: "Glavnye vhody: ploshchad pola/sten i uroven remonta.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "surfaces",
        title: { sr: "Povrsine", en: "Surfaces", ru: "Poverkhnosti" },
        description: {
          sr: "Unesi ono sto znas, ostalo moze rough fallback.",
          en: "Provide known values; unknowns can use rough fallback.",
          ru: "Vvedite izvestnoe; neizvestnoe mozhno rough.",
        },
        fields: [
          {
            key: "bathroomFloorAreaM2",
            kind: "number",
            importance: "required",
            label: { sr: "Kvadratura poda (m2)", en: "Floor area (m2)", ru: "Ploshchad pola (m2)" },
          },
          {
            key: "bathroomWallTileAreaM2",
            kind: "number",
            importance: "optional",
            unknownAllowed: true,
            label: {
              sr: "Kvadratura zidova za plocice (m2)",
              en: "Wall tile area (m2)",
              ru: "Ploshchad sten pod plitku (m2)",
            },
          },
          {
            key: "renovationLevel",
            kind: "select",
            importance: "required",
            label: {
              sr: "Nivo renoviranja",
              en: "Renovation level",
              ru: "Uroven remonta",
            },
            options: [
              { value: "cosmetic", label: { sr: "Kozmeticki", en: "Cosmetic", ru: "Kosmeticheskiy" } },
              { value: "mid", label: { sr: "Srednji", en: "Medium", ru: "Sredniy" } },
              { value: "full", label: { sr: "Komplet", en: "Full", ru: "Polniy" } },
            ],
          },
        ],
      },
      {
        id: "systems",
        title: { sr: "Instalacije", en: "Systems", ru: "Kommunikatsii" },
        description: {
          sr: "Ovo znacajno menja trosak.",
          en: "These strongly affect cost range.",
          ru: "Eto silno vliyaet na diapazon stoimosti.",
        },
        fields: [
          {
            key: "replacePlumbing",
            kind: "toggle",
            importance: "required",
            label: { sr: "Menjaju se vodoinstalacije", en: "Replace plumbing", ru: "Zamena santekhniki" },
          },
          {
            key: "replaceElectrical",
            kind: "toggle",
            importance: "required",
            label: { sr: "Menjaju se elektroinstalacije", en: "Replace electrical", ru: "Zamena elektro" },
          },
          {
            key: "sanitaryElementsCount",
            kind: "number",
            importance: "optional",
            label: { sr: "Broj sanitarnih elemenata", en: "Sanitary elements count", ru: "Kolichestvo sanitarnykh elementov" },
          },
        ],
      },
    ],
  },
  ufh: {
    task: "ufh",
    title: { sr: "Podno grejanje", en: "Underfloor heating", ru: "Tepliy pol" },
    summary: {
      sr: "Bitni su m2 zone i tip sistema.",
      en: "Heated area and system type are essential.",
      ru: "Vazhny ploshchad zony i tip sistemy.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "scope",
        title: { sr: "Obim", en: "Scope", ru: "Obem" },
        description: { sr: "Unesi grejanu zonu, ne ceo stan.", en: "Enter heated zone, not total property.", ru: "Vvedite obogrevaemuyu zonu, ne ves obekt." },
        fields: [
          {
            key: "heatedAreaM2",
            kind: "number",
            importance: "required",
            label: { sr: "Grejana povrsina (m2)", en: "Heated area (m2)", ru: "Obogrevaemaya ploshchad (m2)" },
          },
          {
            key: "systemType",
            kind: "select",
            importance: "required",
            label: { sr: "Tip sistema", en: "System type", ru: "Tip sistemy" },
            options: [
              { value: "water", label: { sr: "Vodeno", en: "Water", ru: "Vodyanoe" } },
              { value: "electric", label: { sr: "Elektricno", en: "Electric", ru: "Elektricheskoe" } },
            ],
          },
          {
            key: "zonesCount",
            kind: "number",
            importance: "optional",
            label: { sr: "Broj zona/termostata", en: "Zones/thermostats count", ru: "Kolichestvo zon/termostatov" },
          },
        ],
      },
    ],
  },
  flooring: {
    task: "flooring",
    title: { sr: "Podne obloge", en: "Flooring", ru: "Napolnye pokrytiya" },
    summary: {
      sr: "Procena zavisi od m2 i tipa obloge.",
      en: "Estimate depends on area and flooring type.",
      ru: "Otsenka zavisit ot ploshchadi i tipa pokrytiya.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "scope",
        title: { sr: "Povrsine i tip", en: "Area and type", ru: "Ploshchad i tip" },
        description: { sr: "Ako ne znas m2, ukljuci rough mode.", en: "Use rough mode if m2 is unknown.", ru: "Ispolzuyte rough, esli m2 neizvestna." },
        fields: [
          {
            key: "floorAreaM2",
            kind: "number",
            importance: "required",
            unknownAllowed: true,
            label: { sr: "Povrsina poda (m2)", en: "Floor area (m2)", ru: "Ploshchad pola (m2)" },
          },
          {
            key: "flooringType",
            kind: "select",
            importance: "required",
            label: { sr: "Tip obloge", en: "Flooring type", ru: "Tip pokrytiya" },
            options: [
              { value: "tile", label: { sr: "Plocice", en: "Tiles", ru: "Plitka" } },
              { value: "parquet", label: { sr: "Parket", en: "Parquet", ru: "Parket" } },
              { value: "laminate", label: { sr: "Laminat", en: "Laminate", ru: "Laminat" } },
              { value: "vinyl", label: { sr: "Vinil", en: "Vinyl", ru: "Vinil" } },
            ],
          },
          {
            key: "removeExistingFloor",
            kind: "toggle",
            importance: "optional",
            label: { sr: "Skidanje postojece obloge", en: "Remove existing flooring", ru: "Demontazh starogo pokrytiya" },
          },
        ],
      },
    ],
  },
  electrical: {
    task: "electrical",
    title: { sr: "Elektroinstalacije", en: "Electrical works", ru: "Elektromontazh" },
    summary: {
      sr: "Bitan je broj tacaka i obim zamene.",
      en: "Points count and replacement scope are key.",
      ru: "Vazhny kolichestvo tochek i obem zamene.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "scope",
        title: { sr: "Obim", en: "Scope", ru: "Obem" },
        description: { sr: "Ako ne znas duzine, unesi bar broj tacaka.", en: "If cable length is unknown, enter points count.", ru: "Esli dliny neizvestny, vvedite kolichestvo tochek." },
        fields: [
          {
            key: "electricalScope",
            kind: "select",
            importance: "required",
            label: { sr: "Obim radova", en: "Work scope", ru: "Obem rabot" },
            options: [
              { value: "partial", label: { sr: "Delimicno", en: "Partial", ru: "Chastichno" } },
              { value: "full", label: { sr: "Komplet", en: "Full", ru: "Polnostyu" } },
            ],
          },
          {
            key: "electricalPointsCount",
            kind: "number",
            importance: "required",
            unknownAllowed: true,
            label: { sr: "Broj elektro tacaka", en: "Electrical points count", ru: "Kolichestvo elektro tochek" },
          },
          {
            key: "cableLengthM",
            kind: "number",
            importance: "optional",
            unknownAllowed: true,
            label: { sr: "Duzina kablova (m)", en: "Cable length (m)", ru: "Dlina kabeley (m)" },
          },
        ],
      },
    ],
  },
  plumbing: {
    task: "plumbing",
    title: { sr: "Vodoinstalacije", en: "Plumbing works", ru: "Santekhnika" },
    summary: {
      sr: "Bitni su broj tacaka i duzina cevi.",
      en: "Points and pipe length are most relevant.",
      ru: "Vazhny tochki i dlina trub.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "scope",
        title: { sr: "Obim", en: "Scope", ru: "Obem" },
        description: { sr: "Unesi minimum: obim + broj prikljucaka.", en: "Minimum: scope + points count.", ru: "Minimum: obem + kolichestvo tochek." },
        fields: [
          {
            key: "plumbingScope",
            kind: "select",
            importance: "required",
            label: { sr: "Obim radova", en: "Work scope", ru: "Obem rabot" },
            options: [
              { value: "partial", label: { sr: "Delimicno", en: "Partial", ru: "Chastichno" } },
              { value: "full", label: { sr: "Komplet", en: "Full", ru: "Polnostyu" } },
            ],
          },
          {
            key: "plumbingPointsCount",
            kind: "number",
            importance: "required",
            label: { sr: "Broj vodovodnih tacaka", en: "Plumbing points count", ru: "Kolichestvo santekhnicheskikh tochek" },
          },
          {
            key: "pipeLengthM",
            kind: "number",
            importance: "optional",
            unknownAllowed: true,
            label: { sr: "Duzina cevi (m)", en: "Pipe length (m)", ru: "Dlina trub (m)" },
          },
        ],
      },
    ],
  },
  insulation: {
    task: "insulation",
    title: { sr: "Izolacija", en: "Insulation", ru: "Uteplenie" },
    summary: {
      sr: "Najbitnije je koja vrsta izolacije i koliko m2.",
      en: "Insulation type and area are key inputs.",
      ru: "Glavnye vhody: tip utepleniya i ploshchad.",
    },
    requiresTotalArea: false,
    sections: [
      {
        id: "scope",
        title: { sr: "Tip i povrsina", en: "Type and area", ru: "Tip i ploshchad" },
        description: { sr: "Ne koristi se ukupna povrsina stana ako izolujes samo deo.", en: "Do not use total property area for partial insulation works.", ru: "Ne nuzhno ispolzovat obshchuyu ploshchad pri lokalnom uteplenii." },
        fields: [
          {
            key: "insulationType",
            kind: "select",
            importance: "required",
            label: { sr: "Tip izolacije", en: "Insulation type", ru: "Tip utepleniya" },
            options: [
              { value: "facade", label: { sr: "Fasada", en: "Facade", ru: "Fasad" } },
              { value: "roof", label: { sr: "Krov", en: "Roof", ru: "Krysha" } },
              { value: "internal", label: { sr: "Unutrasnja", en: "Internal", ru: "Vnutrennyaya" } },
            ],
          },
          {
            key: "insulationAreaM2",
            kind: "number",
            importance: "required",
            unknownAllowed: true,
            label: { sr: "Povrsina izolacije (m2)", en: "Insulation area (m2)", ru: "Ploshchad utepleniya (m2)" },
          },
          {
            key: "insulationThicknessCm",
            kind: "number",
            importance: "niceToHave",
            label: { sr: "Debljina (cm)", en: "Thickness (cm)", ru: "Tolshchina (cm)" },
          },
        ],
      },
    ],
  },
  fullreno: {
    task: "fullreno",
    title: { sr: "Kompletno renoviranje", en: "Full renovation", ru: "Polniy remont" },
    summary: {
      sr: "Ovde ukupna kvadratura ima smisla i potrebna je.",
      en: "Total property area is relevant and required here.",
      ru: "Zdes obshchaya ploshchad relavantna i obyazatelna.",
    },
    requiresTotalArea: true,
    sections: [
      {
        id: "overview",
        title: { sr: "Opsti obim", en: "General scope", ru: "Obshchiy obem" },
        description: {
          sr: "Unesi globalne parametre za ceo prostor.",
          en: "Enter global inputs for the whole property.",
          ru: "Vvedite globalnye parametry dlya vsego obekta.",
        },
        fields: [
          {
            key: "overallCondition",
            kind: "select",
            importance: "required",
            label: { sr: "Stanje prostora", en: "Current condition", ru: "Sostoyanie obekta" },
            options: [
              { value: "good", label: { sr: "Dobro", en: "Good", ru: "Khoroshee" } },
              { value: "medium", label: { sr: "Srednje", en: "Medium", ru: "Srednee" } },
              { value: "poor", label: { sr: "Lose", en: "Poor", ru: "Plokhoe" } },
            ],
          },
          {
            key: "includeSystems",
            kind: "chips",
            importance: "optional",
            label: { sr: "Sistemi koji ulaze u obim", en: "Systems included", ru: "Vklyuchennye sistemy" },
            help: { sr: "npr. elektro, voda, podovi, stolarija", en: "e.g. electrical, plumbing, flooring, windows", ru: "naprimer, elektro, santekhnika, poly, okna" },
          },
        ],
      },
    ],
  },
};

export function needsTotalArea(selectedTasks: PlannerTaskType[]): boolean {
  return selectedTasks.some((task) => TASK_FORM_CONFIG[task]?.requiresTotalArea);
}

export function commonFieldsForSelection(
  selectedTasks: PlannerTaskType[],
): CommonProjectFieldConfig[] {
  const needsArea = needsTotalArea(selectedTasks);
  return COMMON_PROJECT_FIELDS.filter((field) =>
    field.visibleWhen === "always" || (field.visibleWhen === "needsTotalArea" && needsArea),
  );
}

export function getTaskConfigs(selectedTasks: PlannerTaskType[]): TaskFormConfig[] {
  return selectedTasks
    .filter((task): task is PlannerTaskType => task in TASK_FORM_CONFIG)
    .map((task) => TASK_FORM_CONFIG[task]);
}
