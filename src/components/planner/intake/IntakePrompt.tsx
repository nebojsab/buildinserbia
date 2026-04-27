type IntakePromptLabels = {
  title: string;
  subtitle: string;
  placeholder: string;
  submit: string;
  skip: string;
  loading: string;
  error: string;
};

type Props = {
  value: string;
  loading: boolean;
  error: string | null;
  labels: IntakePromptLabels;
  onChange: (next: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
};

export function IntakePrompt({ value, loading, error, labels, onChange, onSubmit, onSkip }: Props) {
  return (
    <div className="card" style={{ padding: "16px 16px 14px" }}>
      <h3 style={{ fontFamily: "var(--heading)", fontSize: 22, margin: 0 }}>{labels.title}</h3>
      <p style={{ margin: "6px 0 12px", fontSize: 13, color: "var(--ink3)", lineHeight: 1.5 }}>{labels.subtitle}</p>
      <textarea
        className="finput"
        rows={4}
        value={value}
        placeholder={labels.placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: "100%", resize: "vertical", minHeight: 96 }}
      />
      {error ? <p style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>{labels.error}: {error}</p> : null}
      <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "space-between" }}>
        <button type="button" className="btn-g" onClick={onSkip}>
          {labels.skip}
        </button>
        <button type="button" className="btn-p" onClick={onSubmit} disabled={loading || value.trim().length < 10}>
          {loading ? labels.loading : labels.submit}
        </button>
      </div>
    </div>
  );
}
