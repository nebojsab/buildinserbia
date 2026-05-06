import { generateProjectDocuments } from "@shared/lib/generateProjectDocs";
import type { ProjectDocument, DocLang } from "@shared/lib/generateProjectDocs";
import type { PlanForm, GeneratedPlan, ProjectType } from "@shared/types/plan";
import type { WizardState } from "../wizard/wizardState";
import type { WizardProjectTree } from "../wizardTree/types";

export type { ProjectDocument };

// Maps wizard subcategory IDs → old planner task keys (used for BOQ templates)
const SUB_TO_TASK: Record<string, string> = {
  kupatilo_kompletno:        "bathreno",
  kupatilo_keramika_dem:     "bathreno",
  kupatilo_keramika_bez:     "bathreno",
  kupatilo_sanitarije_dem:   "bathequip",
  kupatilo_sanitarije_bez:   "bathequip",
  kupatilo_instalacije:      "plumbing",
  podovi_parket:             "flooring",
  podovi_laminat:            "flooring",
  podovi_keramika:           "flooring",
  podovi_brodski:            "flooring",
  podovi_vinil:              "flooring",
  podovi_epoxy:              "flooring",
  podovi_mikrocement:        "flooring",
  zidovi_krecenje:           "finishing",
  zidovi_gipskarton:         "finishing",
  zidovi_dekorativni_malter: "finishing",
  zidovi_tapete:             "finishing",
  prozori_zamena:            "winreplace",
  vrata_unutrasnja:          "winreplace",
  vrata_ulazna:              "winreplace",
  elektrika_kompletna:       "electrical",
  elektrika_delimicna:       "electrical",
  elektrika_klima:           "electrical",
  elektrika_smarthome:       "electrical",
  vodovod_kompletna_zamena:  "plumbing",
  vodovod_delimicna:         "plumbing",
  vodovod_bojler:            "plumbing",
  grejanje_kotao:            "plumbing",
  grejanje_radijatori:       "plumbing",
  grejanje_podno:            "ufh",
  kuhinja_namestaj:          "kitchen",
  kuhinja_keramika:          "flooring",
  kuhinja_instalacije:       "plumbing",
  fasada_stiropor:           "insulation",
  fasada_kamena_vuna:        "insulation",
  fasada_hidroizolacija:     "insulation",
  krov_zamena_pokrivaca:          "roof",
  krov_termoizolacija_potkrovlja: "roof",
  krov_reparatura:                "roof",

  // Izgradnja (new build) subcategories
  dok_idejni:                     "projektna_dok",
  dok_gradevinska_dozvola:        "projektna_dok",
  dok_izvodjacki:                 "projektna_dok",
  iskop:                          "masinski_iskop",
  temelji_temeljne_trake:         "foundations",
  konstrukcija_zidanje:           "walls",
  konstrukcija_ploce:             "ab_ploce",
  konstrukcija_stepenice:         "stepenice",
  krov_konstrukcija:              "roof",
  krov_pokrivac:                  "roof",
  fasada_etics:                   "insulation",
  fasada_malterisanje:            "spoljasnje_malterisanje",
  stolarija_prozori:              "winreplace",
  stolarija_ulazna_vrata:         "stolarija_ulazna",
  stolarija_garazna_vrata:        "garazna_vrata",
  elektro_kompletna:              "electrical",
  elektro_slaba_struja:           "slaba_struja",
  elektro_solar:                  "solarni_sistem",
  vik_kompletna:                  "plumbing",
  grejanje_klima:                 "klima",
  grejanje_rekuperacija:          "rekuperacija",
  zavrse_malterisanje:            "unutr_malterisanje",
  zavrse_podovi:                  "flooring",
  zavrse_krecenje:                "finishing",
  zavrse_unutrasnja_stolarija:    "unutr_stolarija",
};

function getFirstAreaM2(fieldValues: Record<string, Record<string, unknown>>): string {
  for (const subVals of Object.values(fieldValues)) {
    for (const v of Object.values(subVals)) {
      if (typeof v === "number" && v > 5) return String(v);
    }
  }
  return "—";
}

const STAGE_LABEL: Record<DocLang, string> = {
  sr: "Planiranje / Priprema",
  en: "Planning / Preparation",
  ru: "Планирование / Подготовка",
};

const USER_PROFILE: Record<DocLang, string> = {
  sr: "Investitor",
  en: "Property owner",
  ru: "Собственник",
};

export function generateWizardDocuments(
  state: WizardState,
  tree: WizardProjectTree,
  lang: string,
): ProjectDocument[] {
  const docLang: DocLang = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
  const l: "sr" | "en" | "ru" = docLang;

  const taskKeySet = new Set<string>();
  for (const subId of state.selectedSubcategories) {
    const tk = SUB_TO_TASK[subId];
    if (tk) taskKeySet.add(tk);
  }
  const taskKeys = Array.from(taskKeySet);

  const allSubs = tree.categories.flatMap((c) => c.subcategories);
  const taskLabels = state.selectedSubcategories
    .map((id) => allSubs.find((s) => s.id === id)?.label[l])
    .filter((v): v is string => Boolean(v));

  const mockForm: PlanForm = {
    projectType: (state.projectType as ProjectType) ?? "reno",
    tasks: taskKeys,
    size: getFirstAreaM2(state.fieldValues),
    budget: 0,
    stage: 0,
    userType: 0,
    infra: 0,
    location: state.location?.municipality ?? "",
  };

  const mockPlan: GeneratedPlan = {
    isMicro: false,
    projectType: (state.projectType as ProjectType) ?? "reno",
    tasks: taskKeys,
    steps: state.selectedSubcategories
      .map((id) => allSubs.find((s) => s.id === id))
      .filter(Boolean)
      .map((sub) => ({ step: sub!.label[l], task: sub!.id })),
    costs: { lo: 0, hi: 0 },
    affKeys: [],
    notes: [],
    infraExtras: [],
    next: [],
    infraPartial: false,
    infraNone: false,
  };

  const ctx = {
    lang: docLang,
    projectType: (state.projectType as ProjectType) ?? "reno",
    projectTitle: tree.label[l],
    taskKeys,
    taskLabels,
    location: state.location?.municipality ?? "",
    sizeM2: getFirstAreaM2(state.fieldValues),
    stageLabel: STAGE_LABEL[docLang],
    userProfile: USER_PROFILE[docLang],
    infrastructure: "—",
  };

  return generateProjectDocuments(mockForm, mockPlan, ctx);
}
