"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastKind = "success" | "error" | "info";

type ToastInput = {
  title?: string;
  description: string;
  kind?: ToastKind;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  title?: string;
  description: string;
  kind: ToastKind;
};

type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const pushToast = useCallback((input: ToastInput) => {
    const id = `toast-${Date.now()}-${seq.current++}`;
    const next: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      kind: input.kind ?? "info",
    };
    setToasts((prev) => [...prev, next]);
    const duration = input.durationMs ?? 3200;
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, duration);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.kind}`}>
            {toast.title ? <p className="toast-title">{toast.title}</p> : null}
            <p className="toast-desc">{toast.description}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return {
    success: (description: string, title = "Uspešno") =>
      context.pushToast({ title, description, kind: "success" }),
    error: (description: string, title = "Greška") =>
      context.pushToast({ title, description, kind: "error", durationMs: 4200 }),
    info: (description: string, title = "Info") =>
      context.pushToast({ title, description, kind: "info" }),
  };
}
