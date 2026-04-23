"use client";

import { useState } from "react";

export function AssistantInput({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (message: string) => void;
}) {
  const [value, setValue] = useState("");

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
        placeholder="Pitaj assistant..."
        disabled={loading}
      />
      <button className="btn-p" type="submit" disabled={loading || !value.trim()} style={{ padding: "10px 14px" }}>
        {loading ? "..." : "Send"}
      </button>
    </form>
  );
}
