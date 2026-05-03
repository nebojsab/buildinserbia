export type Lang = "sr" | "en";
export type LocalizedText = Record<Lang, string>;

export type FieldKind =
  | "number"     // numeric input with unit
  | "text"       // free text / custom note
  | "toggle"     // yes/no boolean
  | "select"     // single choice from list
  | "chips"      // multi-select chips
  | "area"       // shorthand: number + m² unit
  | "length";    // shorthand: number + m unit

export type FieldImportance = "required" | "optional" | "niceToHave";

export type FieldOption = {
  value: string;
  label: LocalizedText;
};

export type WizardField = {
  key: string;
  kind: FieldKind;
  label: LocalizedText;
  importance: FieldImportance;
  unit?: string;
  predefined?: number[];        // quick-pick values for number/area/length fields
  unknownAllowed?: boolean;     // allows "Ne znam" option
  options?: FieldOption[];      // for select / chips
  help?: LocalizedText;
  placeholder?: LocalizedText;
  showWhen?: Record<string, string | boolean>; // conditional visibility within subcategory
};

export type WizardSubcategory = {
  id: string;
  label: LocalizedText;
  description?: LocalizedText;
  fields: WizardField[];
  estimateNotes?: LocalizedText; // shown in Level 4 output
};

export type WizardCategory = {
  id: string;
  label: LocalizedText;
  icon: string;
  description?: LocalizedText;
  subcategories: WizardSubcategory[];
};

export type WizardProjectTree = {
  projectType: string;
  label: LocalizedText;
  categories: WizardCategory[];
};
