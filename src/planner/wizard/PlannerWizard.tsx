import { useState, useEffect } from "react";
import { wizardTrees } from "../wizardTree";
import { initialWizardState, canProceed } from "./wizardState";
import type { WizardState } from "./wizardState";
import { getI18n } from "./wizardI18n";
import { WizardProgress } from "./WizardProgress";
import { WizardNav } from "./WizardNav";
import { Step0ProjectType } from "./Step0ProjectType";
import { Step1Location } from "./Step1Location";
import { Step2Categories } from "./Step2Categories";
import { Step3Subcategories } from "./Step3Subcategories";
import { Step4Details } from "./Step4Details";
import { Step5Output } from "./Step5Output";

type Props = {
  lang?: string;
  onComplete?: (state: WizardState) => void;
};

const TOTAL_STEPS = 5; // 0-4 are navigable; step 5 is output

export function PlannerWizard({ lang = "sr", onComplete }: Props) {
  const [state, setState] = useState<WizardState>(initialWizardState);
  const i18n = getI18n(lang);
  const tree = state.projectType ? wizardTrees[state.projectType] : null;

  // Scroll wizard to top whenever step changes
  useEffect(() => {
    const el = document.getElementById("kucaplan-wizard");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.step]);

  function goNext() {
    if (state.step === TOTAL_STEPS) {
      onComplete?.(state);
      return;
    }
    setState((s) => ({ ...s, step: s.step + 1 }));
  }

  function goBack() {
    setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }));
  }

  function setProjectType(pt: string) {
    setState((s) => ({
      ...s,
      projectType: pt,
      selectedCategories: [],
      selectedSubcategories: [],
      fieldValues: {},
    }));
  }

  function setCategories(cats: string[]) {
    if (!tree) return;
    // Remove subcategories that no longer belong to selected categories
    const validSubIds = new Set(
      tree.categories
        .filter((c) => cats.includes(c.id))
        .flatMap((c) => c.subcategories.map((s) => s.id))
    );
    setState((s) => ({
      ...s,
      selectedCategories: cats,
      selectedSubcategories: s.selectedSubcategories.filter((id) => validSubIds.has(id)),
    }));
  }

  const isOutputStep = state.step === 5;

  return (
    <div
      id="kucaplan-wizard"
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "0 16px",
        fontFamily: "var(--sans)",
      }}
    >
      <WizardProgress step={state.step} i18n={i18n} />

      <div className="fu" key={state.step}>
        {state.step === 0 && (
          <Step0ProjectType
            lang={lang}
            selected={state.projectType}
            onSelect={setProjectType}
            i18n={i18n}
          />
        )}

        {state.step === 1 && (
          <Step1Location
            lang={lang}
            location={state.location}
            onChange={(loc) => setState((s) => ({ ...s, location: loc }))}
            i18n={i18n}
          />
        )}

        {state.step === 2 && tree && (
          <Step2Categories
            lang={lang}
            tree={tree}
            selected={state.selectedCategories}
            onChange={setCategories}
            i18n={i18n}
          />
        )}

        {state.step === 3 && tree && (
          <Step3Subcategories
            lang={lang}
            tree={tree}
            selectedCategories={state.selectedCategories}
            selected={state.selectedSubcategories}
            onChange={(subs) => setState((s) => ({ ...s, selectedSubcategories: subs }))}
            i18n={i18n}
          />
        )}

        {state.step === 4 && tree && (
          <Step4Details
            lang={lang}
            tree={tree}
            selectedSubcategories={state.selectedSubcategories}
            values={state.fieldValues}
            onChange={(fv) => setState((s) => ({ ...s, fieldValues: fv }))}
            i18n={i18n}
          />
        )}

        {state.step === 5 && tree && (
          <Step5Output
            lang={lang}
            state={state}
            tree={tree}
            i18n={i18n}
            onRestart={() => setState(initialWizardState())}
          />
        )}
      </div>

      {!isOutputStep && (
        <WizardNav
          step={state.step}
          totalSteps={TOTAL_STEPS}
          canGoNext={canProceed(state)}
          onBack={goBack}
          onNext={goNext}
          i18n={i18n}
        />
      )}
    </div>
  );
}
