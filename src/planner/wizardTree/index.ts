export type * from "./types";
export { renovacijaTree } from "./renovacija";
export { izgradnjaTree } from "./izgradnja";
export { dogradnjaTree } from "./dogradnja";
export { dvoristTree } from "./dvoriste";

import { renovacijaTree } from "./renovacija";
import { izgradnjaTree } from "./izgradnja";
import { dogradnjaTree } from "./dogradnja";
import { dvoristTree } from "./dvoriste";
import type { WizardProjectTree } from "./types";

export const wizardTrees: Record<string, WizardProjectTree> = {
  reno: renovacijaTree,
  newbuild: izgradnjaTree,
  extension: dogradnjaTree,
  yard: dvoristTree,
};
