"use client";

import { useState } from "react";

export function AssistantInput({
  loading,
  onSubmit,
  locale = "sr",
}: {
  loading: boolean;
  onSubmit: (message: string) => void;
  locale?: "sr" | "en" | "ru";
}) {
  const [value, setValue] = useState("");

  const placeholder = locale === "en" ? "Ask assistant..." : locale === "ru" ? "Задайте вопрос..." : "Pitaj assistant...";
  const sendLabel = locale === "en" ? "Send" : locale === "ru" ? "Отправить" : "Pošalji";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        onSubmit(value.trim());
        setValue("");
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <input
        className="finput"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={loading}
      />
      <button className="btn-p" type="submit" disabled={loading || !value.trim()} style={{ padding: "10px 14px" }}>
        {loading ? "..." : sendLabel}
      </button>
    </form>
  );
}
