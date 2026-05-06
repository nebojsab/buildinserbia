"use client";

import { useState, useRef } from "react";

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg";
const MAX_MB = 10;

const T = {
  sr: {
    title: "Kontaktirajte nas",
    sub: "Pošaljite nam ideju, predlog ili pitanje. Odgovorićemo u što kraćem roku.",
    name: "Ime i prezime",
    email: "Email adresa",
    phone: "Broj telefona",
    phoneOptional: "(opciono)",
    message: "Vaša poruka",
    messagePlaceholder: "Opišite vašu ideju, pitanje ili predlog...",
    attach: "Priložite fajl",
    attachOptional: "(opciono)",
    attachHint: "PDF, Word, Excel, TXT, PNG, JPG — do 10 MB",
    attachClick: "Kliknite da izaberete fajl",
    remove: "Ukloni",
    submit: "Pošalji poruku",
    sending: "Šalje se...",
    successTitle: "Poruka je poslata!",
    successBody: "Hvala vam! Javićemo se u najkraćem roku.",
    newMessage: "Pošalji novu poruku",
    close: "Zatvori",
    required: "Obavezno polje",
    tooBig: `Fajl je prevelik. Maksimum je ${MAX_MB} MB.`,
    error: "Greška pri slanju. Pokušajte ponovo.",
  },
  en: {
    title: "Contact us",
    sub: "Send us an idea, suggestion or question. We'll get back to you as soon as possible.",
    name: "Full name",
    email: "Email address",
    phone: "Phone number",
    phoneOptional: "(optional)",
    message: "Your message",
    messagePlaceholder: "Describe your idea, question or suggestion...",
    attach: "Attach a file",
    attachOptional: "(optional)",
    attachHint: "PDF, Word, Excel, TXT, PNG, JPG — up to 10 MB",
    attachClick: "Click to select a file",
    remove: "Remove",
    submit: "Send message",
    sending: "Sending...",
    successTitle: "Message sent!",
    successBody: "Thank you! We'll get back to you as soon as possible.",
    newMessage: "Send another message",
    close: "Close",
    required: "Required field",
    tooBig: `File is too large. Maximum is ${MAX_MB} MB.`,
    error: "Error sending. Please try again.",
  },
  ru: {
    title: "Свяжитесь с нами",
    sub: "Отправьте нам идею, предложение или вопрос. Мы ответим в ближайшее время.",
    name: "Имя и фамилия",
    email: "Email адрес",
    phone: "Номер телефона",
    phoneOptional: "(необязательно)",
    message: "Ваше сообщение",
    messagePlaceholder: "Опишите вашу идею, вопрос или предложение...",
    attach: "Прикрепить файл",
    attachOptional: "(необязательно)",
    attachHint: "PDF, Word, Excel, TXT, PNG, JPG — до 10 МБ",
    attachClick: "Нажмите, чтобы выбрать файл",
    remove: "Удалить",
    submit: "Отправить",
    sending: "Отправка...",
    successTitle: "Сообщение отправлено!",
    successBody: "Спасибо! Мы свяжемся с вами в ближайшее время.",
    newMessage: "Отправить ещё одно сообщение",
    close: "Закрыть",
    required: "Обязательное поле",
    tooBig: `Файл слишком большой. Максимум ${MAX_MB} МБ.`,
    error: "Ошибка при отправке. Попробуйте ещё раз.",
  },
};

type Lang = "sr" | "en" | "ru";

export function ContactDrawer({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  const t = T[lang] ?? T.sr;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setName(""); setEmail(""); setPhone(""); setMessage(""); setFile(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      if (phone.trim()) fd.append("phone", phone.trim());
      fd.append("message", message.trim());
      fd.append("lang", lang);
      if (file) fd.append("file", file);
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setSuccess(true);
      resetForm();
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box" };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 140, pointerEvents: open ? "auto" : "none" }}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", inset: 0, border: "none",
          background: open ? "rgba(24,24,27,.36)" : "transparent",
          opacity: open ? 1 : 0, transition: "opacity .2s",
        }}
      />
      <aside
        style={{
          position: "absolute", right: 0, top: "var(--banner-h, 0px)" as string, height: "calc(100% - var(--banner-h, 0px))" as string,
          width: "min(480px, 100vw)",
          background: "var(--card)", borderLeft: "1px solid var(--bdr)",
          boxShadow: "var(--sh2)",
          transform: open ? "translateX(0)" : "translateX(102%)",
          transition: "transform .22s cubic-bezier(.22,1,.36,1)",
          display: "flex", flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px", borderBottom: "1px solid var(--bdr)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "sticky", top: 0, background: "var(--card)", zIndex: 1,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{t.title}</p>
          <button type="button" className="btn-g" style={{ padding: "6px 10px", fontSize: 12 }} onClick={onClose}>
            {t.close}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 16px", flex: 1 }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "56px 16px" }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>✅</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{t.successTitle}</p>
              <p style={{ fontSize: 13.5, color: "var(--ink3)", lineHeight: 1.6 }}>{t.successBody}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
                <button
                  type="button"
                  className="btn-g"
                  style={{ fontSize: 13 }}
                  onClick={() => setSuccess(false)}
                >
                  {t.newMessage}
                </button>
                <button
                  type="button"
                  className="btn-p"
                  style={{ fontSize: 13 }}
                  onClick={() => { setSuccess(false); onClose(); }}
                >
                  {t.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.55, marginBottom: 4 }}>{t.sub}</p>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink3)", marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                  {t.name} <span style={{ color: "var(--acc)" }}>*</span>
                </label>
                <input className="finput" style={inputStyle} required value={name} onChange={e => setName(e.target.value)} placeholder={t.name} />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink3)", marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                  {t.email} <span style={{ color: "var(--acc)" }}>*</span>
                </label>
                <input className="finput" style={inputStyle} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ime@primer.com" />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink3)", marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                  {t.phone} <span style={{ fontSize: 11, fontWeight: 400 }}>{t.phoneOptional}</span>
                </label>
                <input className="finput" style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+381 60 123 4567" />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink3)", marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                  {t.message} <span style={{ color: "var(--acc)" }}>*</span>
                </label>
                <textarea
                  className="finput"
                  style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
                  required
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                />
              </div>

              {/* File upload */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink3)", marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" as const }}>
                  {t.attach} <span style={{ fontSize: 11, fontWeight: 400 }}>{t.attachOptional}</span>
                </label>
                {file ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--bgw)", border: "1px solid var(--bdr)", borderRadius: "var(--r)" }}>
                    <span style={{ fontSize: 16 }}>📎</span>
                    <span style={{ fontSize: 12.5, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                    <span style={{ fontSize: 11, color: "var(--ink4)", flexShrink: 0 }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      className="btn-g"
                      style={{ fontSize: 11, padding: "3px 8px", flexShrink: 0 }}
                      onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    >
                      {t.remove}
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: "14px 16px",
                      border: "1.5px dashed var(--bdr2)",
                      borderRadius: "var(--r)",
                      textAlign: "center",
                      cursor: "pointer",
                      color: "var(--ink3)",
                      fontSize: 12.5,
                      lineHeight: 1.6,
                    }}
                  >
                    <div>📎 {t.attachClick}</div>
                    <div style={{ fontSize: 11, color: "var(--ink4)", marginTop: 3 }}>{t.attachHint}</div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED}
                  style={{ display: "none" }}
                  onChange={e => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.size > MAX_MB * 1024 * 1024) {
                      setError(t.tooBig);
                      return;
                    }
                    setFile(f);
                    setError(null);
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "#991B1B", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--r)", padding: "8px 10px" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-p"
                disabled={loading}
                style={{ marginTop: 4, fontSize: 14, padding: "11px 20px" }}
              >
                {loading ? t.sending : t.submit}
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
