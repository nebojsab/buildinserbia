import { useCallback, useState } from "react";
import type { Lang } from "../translations";
import type { PlannerAgentApply, ChatLine } from "../lib/plannerConversationalAgentLocal";
import { runLocalPlannerAgentTurn } from "../lib/plannerConversationalAgentLocal";

type Labels = {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  apply: string;
  open: string;
  close: string;
  hint: string;
  emptyGoal: string;
};

type Props = {
  lang: Lang;
  projectGoal: string;
  onApplySuggestion: (apply: PlannerAgentApply) => void;
  onTranscript: (lines: ChatLine[]) => void;
  labels: Labels;
};

export function PlannerConversationalAgent({
  lang,
  projectGoal,
  onApplySuggestion,
  onTranscript,
  labels,
}: Props) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [lastApply, setLastApply] = useState<PlannerAgentApply | null>(null);

  const push = useCallback(
    (next: ChatLine[]) => {
      setMessages(next);
      onTranscript(next);
    },
    [onTranscript],
  );

  const send = useCallback(() => {
    const text = input.trim();
    const userText =
      text.length > 0 ? text : messages.length === 0 ? projectGoal.trim() : "";
    if (userText.length < 3) return;

    const history = messages;
    const asUser: ChatLine = { role: "user", text: userText };
    const { reply, apply } = runLocalPlannerAgentTurn(projectGoal, history, userText, lang);
    const asAssistant: ChatLine = { role: "assistant", text: reply };
    push([...history, asUser, asAssistant]);
    setInput("");
    setLastApply(apply ?? null);
  }, [input, lang, messages, projectGoal, push]);

  const apply = useCallback(() => {
    if (!lastApply) return;
    onApplySuggestion(lastApply);
    setLastApply(null);
  }, [lastApply, onApplySuggestion]);

  return (
    <div
      className="planner-rag"
      style={{
        marginTop: 14,
        marginBottom: 10,
        border: "1px solid var(--bdr)",
        borderRadius: "var(--r)",
        background: "var(--blubg)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-g"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "none",
          borderRadius: 0,
          background: "rgba(59, 130, 246, 0.08)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>{labels.title}</span>
        <span style={{ fontSize: 12, color: "var(--ink3)" }}>{open ? labels.close : labels.open}</span>
      </button>
      {open ? (
        <div style={{ padding: "12px 14px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: "var(--ink3)" }}>{labels.subtitle}</p>
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              display: "grid",
              gap: 8,
              marginBottom: 10,
              fontSize: 12.5,
              lineHeight: 1.55,
            }}
          >
            {messages.length === 0 ? (
              <p style={{ margin: 0, color: "var(--ink4)" }}>{labels.hint}</p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "end" : "start",
                  maxWidth: "96%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: m.role === "user" ? "var(--accbg)" : "var(--card)",
                  border: "1px solid " + (m.role === "user" ? "var(--accmid)" : "var(--bdr)"),
                  color: "var(--ink2)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
          {lastApply ? (
            <button type="button" className="btn-p" onClick={apply} style={{ fontSize: 13, marginBottom: 10, width: "100%" }}>
              {labels.apply}
            </button>
          ) : null}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <textarea
              className="finput"
              rows={2}
              value={input}
              placeholder={labels.placeholder}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, resize: "vertical", minHeight: 48, fontSize: 13 }}
            />
            <button type="button" className="btn-p" onClick={() => void send()} style={{ fontSize: 12, padding: "10px 14px" }}>
              {labels.send}
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 10.5, color: "var(--ink4)" }}>{labels.emptyGoal}</p>
        </div>
      ) : null}
    </div>
  );
}
