import type { WizardI18n } from "./wizardI18n";

type Props = {
  step: number;
  totalSteps: number;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
  i18n: WizardI18n;
};

export function WizardNav({ step, totalSteps, canGoNext, onBack, onNext, i18n }: Props) {
  const isLast = step === totalSteps - 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 20,
        marginTop: 8,
        borderTop: "1px solid var(--bdr)",
      }}
    >
      <button
        className="btn-g"
        onClick={onBack}
        style={{ visibility: step === 0 ? "hidden" : "visible" }}
      >
        {i18n.back}
      </button>

      <span style={{ fontSize: 12, color: "var(--ink4)" }}>
        {step + 1} / {totalSteps + 1}
      </span>

      <button
        className="btn-p"
        onClick={onNext}
        disabled={!canGoNext}
        style={{ opacity: canGoNext ? 1 : 0.45, cursor: canGoNext ? "pointer" : "not-allowed" }}
      >
        {isLast ? i18n.generate : i18n.next}
      </button>
    </div>
  );
}
