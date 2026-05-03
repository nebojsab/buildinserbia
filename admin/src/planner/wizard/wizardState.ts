export type ZoneType = "gradska" | "prigradska" | "seoska";

export type WizardLocation = {
  municipality: string;
  zoneType: ZoneType | null;
};

export type FieldValues = Record<string, unknown>;

export type WizardState = {
  step: number;
  projectType: string | null;
  location: WizardLocation | null;
  selectedCategories: string[];
  selectedSubcategories: string[];
  fieldValues: Record<string, FieldValues>;
};

export function initialWizardState(): WizardState {
  return {
    step: 0,
    projectType: null,
    location: null,
    selectedCategories: [],
    selectedSubcategories: [],
    fieldValues: {},
  };
}

export function canProceed(state: WizardState): boolean {
  switch (state.step) {
    case 0:
      return state.projectType !== null;
    case 1:
      return (
        state.location !== null &&
        state.location.municipality.trim().length >= 2 &&
        state.location.zoneType !== null
      );
    case 2:
      return state.selectedCategories.length > 0;
    case 3:
      return state.selectedSubcategories.length > 0;
    case 4:
      return true;
    default:
      return true;
  }
}
