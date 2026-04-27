import { useMemo, useState } from "react";
import type { PlannerIntakeClarificationQuestion } from "../../../types/plannerIntake";

type ClarificationLabels = {
  title: string;
  subtitle: string;
  answerPlaceholder: string;
  continue: string;
  skip: string;
};

type Props = {
  questions: PlannerIntakeClarificationQuestion[];
  labels: ClarificationLabels;
  onContinue: (answers: Record<string, string>) => void;
  onSkip: () => void;
};

export function ClarificationMiniStep({ questions, labels, onContinue, onSkip }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const canContinue = useMemo(
    () => questions.some((question) => (answers[question.fieldKey] ?? "").trim().length > 0),
    [answers, questions],
  );

  return (
    <div className="card" style={{ padding: "16px 16px 14px" }}>
      <h3 style={{ fontFamily: "var(--heading)", fontSize: 22, margin: 0 }}>{labels.title}</h3>
      <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--ink3)", lineHeight: 1.5 }}>{labels.subtitle}</p>
      <div style={{ display: "grid", gap: 10 }}>
        {questions.map((question) => (
          <div key={question.id}>
            <label className="flabel">{question.question}</label>
            <input
              className="finput"
              value={answers[question.fieldKey] ?? ""}
              placeholder={labels.answerPlaceholder}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.fieldKey]: event.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "space-between" }}>
        <button type="button" className="btn-g" onClick={onSkip}>
          {labels.skip}
        </button>
        <button type="button" className="btn-p" onClick={() => onContinue(answers)} disabled={!canContinue}>
          {labels.continue}
        </button>
      </div>
    </div>
  );
}
