type IntakeEvent =
  | "intake_started"
  | "intake_reviewed"
  | "intake_confirmed"
  | "intake_fallback"
  | "intake_clarification_opened"
  | "intake_clarification_completed";

type IntakeEventPayload = {
  locale: "sr" | "en" | "ru";
  confidence?: number;
  parentCategory?: string;
  parentCategoryLabel?: string;
  taskCount?: number;
  taskKeys?: string[];
  taskLabels?: string[];
};

export function trackPlannerIntakeEvent(event: IntakeEvent, payload: IntakeEventPayload): void {
  if (typeof window === "undefined") return;
  const isDevRuntime =
    (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") ||
    (typeof import.meta !== "undefined" && Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV));
  const params = new URLSearchParams(window.location.search);
  const telemetryEnabled = params.get("debugIntake") === "1" || params.get("debugIntake") === "true";
  const body = JSON.stringify({ event, ts: Date.now(), ...payload });
  window.dispatchEvent(
    new CustomEvent("planner-intake-event", {
      detail: JSON.parse(body),
    }),
  );
  if (telemetryEnabled) {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/planner-intake-event", body);
      } else {
        void fetch("/api/planner-intake-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      // swallow telemetry failures in MVP
    }
  }
  if (isDevRuntime) {
    // Lightweight telemetry hook for MVP; can be replaced with backend analytics later.
    // eslint-disable-next-line no-console
    console.info("[planner-intake]", event, payload);
  }
}
