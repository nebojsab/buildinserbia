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

const GENERATING_MESSAGES: Record<"sr" | "en" | "ru", [string, string, string]> = {
  sr: ["Analiziramo vaš projekat...", "Računamo troškove za vašu zonu...", "Plan je spreman!"],
  en: ["Analysing your project...", "Calculating costs for your zone...", "Plan is ready!"],
  ru: ["Анализируем ваш проект...", "Рассчитываем стоимость для вашей зоны...", "План готов!"],
};

type Props = {
  lang?: string;
  initialProjectType?: string;
  onComplete?: (state: WizardState) => void;
};

const TOTAL_STEPS = 5; // 0-4 are navigable; step 5 is output

export function PlannerWizard({ lang = "sr", initialProjectType, onComplete }: Props) {
  const [state, setState] = useState<WizardState>(() =>
    initialProjectType
      ? { ...initialWizardState(), projectType: initialProjectType, step: 1 }
      : initialWizardState()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIdx, setGeneratingIdx] = useState(0);
  const i18n = getI18n(lang);
  const tree = state.projectType ? wizardTrees[state.projectType] : null;
  const l: "sr" | "en" | "ru" = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";

  // Scroll wizard into view on step advances — never on initial load (step 0)
  useEffect(() => {
    if (state.step === 0) return;
    const el = document.getElementById("kucaplan-wizard");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.step]);

  function goNext() {
    if (state.step === TOTAL_STEPS) {
      onComplete?.(state);
      return;
    }
    // Show loading sequence before the result step
    if (state.step === 4) {
      setIsGenerating(true);
      setGeneratingIdx(0);
      // Scroll wizard into view so loading state is visible
      requestAnimationFrame(() => {
        const el = document.getElementById("kucaplan-wizard");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      setTimeout(() => setGeneratingIdx(1), 550);
      setTimeout(() => setGeneratingIdx(2), 1150);
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratingIdx(0);
        setState((s) => ({ ...s, step: 5 }));
      }, 1700);
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
    // Auto-advance — show selected state briefly then move forward
    setTimeout(() => {
      setState((s) => (s.step === 0 ? { ...s, step: 1 } : s));
    }, 240);
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

  // Build micro-summary string shown below progress bar
  const progressSummary = (() => {
    const parts: string[] = [];
    if (state.projectType && tree) parts.push(tree.label[l]);
    if (state.location?.municipality) {
      const zone = state.location.zoneType;
      const zoneLabels: Record<string, Record<string, string>> = {
        gradska: { sr: "Gradska", en: "Urban", ru: "Городская" },
        prigradska: { sr: "Prigradska", en: "Suburban", ru: "Пригородная" },
        seoska: { sr: "Seoska", en: "Rural", ru: "Сельская" },
      };
      const zonePart = zone ? ` · ${zoneLabels[zone]?.[l] ?? zone}` : "";
      parts.push(`${state.location.municipality}${zonePart}`);
    }
    if (state.selectedSubcategories.length > 0 && tree) {
      const subLabels = tree.categories
        .flatMap((c) => c.subcategories)
        .filter((s) => state.selectedSubcategories.includes(s.id))
        .map((s) => s.label[l]);
      if (subLabels.length > 0) {
        const shown = subLabels.slice(0, 3).join(", ");
        const more = subLabels.length > 3 ? ` +${subLabels.length - 3}` : "";
        parts.push(shown + more);
      }
    } else if (state.selectedCategories.length > 0 && tree) {
      const catLabels = tree.categories
        .filter((c) => state.selectedCategories.includes(c.id))
        .map((c) => c.label[l]);
      if (catLabels.length > 0) parts.push(catLabels.join(", "));
    }
    return parts.length > 1 ? parts.join(" · ") : "";
  })();

  return (
    <div
      id="kucaplan-wizard"
      style={{
        fontFamily: "var(--sans)",
      }}
    >
      <WizardProgress step={state.step} i18n={i18n} summary={isOutputStep ? undefined : progressSummary} />

      {isGenerating && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", gap: 18 }}>
          {(GENERATING_MESSAGES[l]).map((msg, i) => {
            const done = i < generatingIdx;
            const active = i === generatingIdx;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: i <= generatingIdx ? 1 : 0.25,
                  transition: "opacity .35s ease",
                  fontSize: "0.9375rem",
                  fontWeight: active ? 600 : 500,
                  color: done ? "var(--grn)" : active ? "var(--ink)" : "var(--ink4)",
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0, transition: "color .35s" }}>
                  {done ? "✓" : active ? "⟳" : "○"}
                </span>
                {msg}
              </div>
            );
          })}
        </div>
      )}

      <div className="fu" key={state.step} style={{ display: isGenerating ? "none" : undefined }}>
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
            onChange={(loc) => {
              setState((s) => ({ ...s, location: loc }));
              // Auto-advance when both fields are filled (triggered by zone selection)
              if (loc.zoneType && loc.municipality.trim().length >= 2) {
                setTimeout(() => {
                  setState((s) => (s.step === 1 ? { ...s, step: 2 } : s));
                }, 340);
              }
            }}
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

      {!isOutputStep && !isGenerating && (
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
