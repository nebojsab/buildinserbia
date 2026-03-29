import { useState } from "react";
import type { GeneratedPlan } from "../types/plan";
import { translations } from "../translations";

type T = (typeof translations)["sr"];

export function SaveModal({
  t,
  onClose,
  plan,
}: {
  t: T;
  onClose: () => void;
  plan: GeneratedPlan | null;
}) {
  const s = t.save;
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const doSave = () => {
    if (!email.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDone(true);
    }, 1200);
  };

  const doCopy = () => {
    const lines = plan?.steps?.map((st, i) => `${i + 1}. ${st.step}`) || [];
    const summary = lines.join("\n");
    void navigator.clipboard?.writeText(summary).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 20,
            color: "var(--ink4)",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        {!done ? (
          <>
            <p
              style={{
                fontFamily: "var(--heading)",
                fontSize: 22,
                fontWeight: 500,
                color: "var(--ink)",
                marginBottom: 8,
                lineHeight: 1.3,
              }}
            >
              {s.title}
            </p>
            <div
              style={{
                background: "var(--grnbg)",
                border: "1px solid var(--grnmid)",
                borderRadius: "var(--r)",
                padding: "11px 14px",
                marginBottom: 18,
              }}
            >
              <p style={{ fontSize: 12.5, color: "var(--grn)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>
                {s.contractorTip}
              </p>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 18, lineHeight: 1.6 }}>{s.sub}</p>
            <div style={{ marginBottom: 16 }}>
              <label className="flabel" htmlFor="save-email">
                {s.emailLabel}
              </label>
              <input
                id="save-email"
                className="finput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={s.emailPh}
                onKeyDown={(e) => e.key === "Enter" && doSave()}
              />
            </div>
            <button
              type="button"
              className="btn-p"
              onClick={doSave}
              disabled={saving || !email.trim()}
              style={{ width: "100%", fontSize: 14, marginBottom: 10 }}
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,.35)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .8s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  {s.submitting}
                </span>
              ) : (
                s.submit
              )}
            </button>
            <button type="button" onClick={doCopy} className="btn-g" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
              {copied ? `✓ ${s.copied}` : `📋 ${s.copySummary}`}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <span style={{ fontSize: 44, display: "block", marginBottom: 14 }}>✅</span>
            <p style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
              {s.okTitle}
            </p>
            <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 16, lineHeight: 1.6 }}>{s.okSub}</p>
            <div
              style={{
                background: "var(--grnbg)",
                border: "1px solid var(--grnmid)",
                borderRadius: "var(--r)",
                padding: "11px 14px",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: 12.5, color: "var(--grn)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>
                {s.contractorTip}
              </p>
            </div>
            <button type="button" onClick={doCopy} className="btn-g" style={{ width: "100%", justifyContent: "center", fontSize: 13, marginBottom: 10 }}>
              {copied ? `✓ ${s.copied}` : `📋 ${s.copySummary}`}
            </button>
            <button type="button" onClick={onClose} className="btn-g" style={{ width: "100%", justifyContent: "center" }}>
              {s.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
