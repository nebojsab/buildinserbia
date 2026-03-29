import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { searchPhoton } from "../lib/photonSearch";
import type { Lang } from "../translations";

type Labels = {
  loading: string;
  noResults: string;
  osmAttr: string;
};

export function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  labels,
  lang,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  labels: Labels;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [showEmpty, setShowEmpty] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipSearchRef = useRef(false);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowEmpty(false);
      setOpen(false);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setOpen(true);
    try {
      const list = await searchPhoton(q, ac.signal, lang);
      if (ac.signal.aborted) return;
      setSuggestions(list);
      setShowEmpty(list.length === 0);
      setHighlight(0);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setSuggestions([]);
      setShowEmpty(false);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowEmpty(false);
      setOpen(false);
      return;
    }
    const t = window.setTimeout(() => {
      void runSearch(q);
    }, 320);
    return () => clearTimeout(t);
  }, [value, runSearch]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = useCallback(
    (s: string) => {
      skipSearchRef.current = true;
      onChange(s);
      setOpen(false);
      setSuggestions([]);
      setShowEmpty(false);
    },
    [onChange]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    const hasList = suggestions.length > 0;
    if (e.key === "ArrowDown" && hasList) {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && hasList) {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && hasList) {
      e.preventDefault();
      pick(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const onFocus = () => {
    const q = value.trim();
    if (q.length >= 2 && suggestions.length === 0 && !loading) {
      void runSearch(q);
    } else if (q.length >= 2 && suggestions.length > 0) {
      setOpen(true);
    }
  };

  const panelVisible =
    open && (loading || suggestions.length > 0 || showEmpty);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        className="finput"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={panelVisible}
      />
      {panelVisible ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            marginTop: 4,
            zIndex: 30,
            background: "var(--card)",
            border: "1.5px solid var(--bdr)",
            borderRadius: "var(--r)",
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "10px 13px",
                fontSize: 13,
                color: "var(--ink3)",
                fontFamily: "var(--sans)",
              }}
            >
              {labels.loading}
            </div>
          ) : null}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={`${s}-${i}`}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => pick(s)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 13px",
                  fontSize: 14,
                  fontFamily: "var(--sans)",
                  border: "none",
                  background:
                    i === highlight ? "var(--accbg)" : "transparent",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          {!loading && showEmpty ? (
            <div
              style={{
                padding: "10px 13px",
                fontSize: 12,
                color: "var(--ink3)",
                fontFamily: "var(--sans)",
              }}
            >
              {labels.noResults}
            </div>
          ) : null}
          {!loading && suggestions.length > 0 ? (
            <div
              style={{
                padding: "6px 10px 8px",
                fontSize: 10,
                color: "var(--ink4)",
                borderTop: "1px solid var(--bdr2)",
                fontFamily: "var(--sans)",
              }}
            >
              {labels.osmAttr}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
