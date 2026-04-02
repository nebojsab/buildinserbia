"use client";

import type { getMaintenanceState } from "@/lib/maintenanceState";

type MaintenanceState = ReturnType<typeof getMaintenanceState>;
type MaintenanceStateResolved = Awaited<MaintenanceState>;

export function MaintenanceResetButton({ status }: { status: MaintenanceStateResolved }) {
  const onReset = () => {
    const form = document.getElementById("maintenance-form") as HTMLFormElement | null;
    if (!form) return;

    const setValue = (name: string, value: string) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!el) return;
      if ("value" in el) el.value = value;
    };

    // mode radio
    const radios = form.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="mode"]`);
    radios.forEach((r) => {
      r.checked = r.value === status.mode;
    });

    // countdown
    const countdownLocalValue = status.countdownAt ? new Date(status.countdownAt).toISOString().slice(0, 16) : "";
    setValue("countdownAt", countdownLocalValue);

    // bgImage file input (cannot re-set a File, but we can clear it)
    const fileInput = form.elements.namedItem("bgImage") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";

    // reset per-language fields + button checkboxes
    (["sr", "en", "ru"] as const).forEach((l) => {
      const block = status.langs[l];
      setValue(`${l}Heading`, block.heading ?? "");
      setValue(`${l}SubTitle`, block.subTitle ?? "");
      setValue(`${l}Body`, block.body ?? "");

      const primaryChk = form.elements.namedItem(`${l}PrimaryEnabled`) as HTMLInputElement | null;
      if (primaryChk) primaryChk.checked = block.primary.enabled;

      const secondaryChk = form.elements.namedItem(`${l}SecondaryEnabled`) as HTMLInputElement | null;
      if (secondaryChk) secondaryChk.checked = block.secondary.enabled;

      setValue(`${l}PrimaryLabel`, block.primary.label ?? "");
      setValue(`${l}PrimaryUrl`, block.primary.url ?? "");
      setValue(`${l}SecondaryLabel`, block.secondary.label ?? "");
      setValue(`${l}SecondaryUrl`, block.secondary.url ?? "");
    });
  };

  return (
    <button type="button" className="btn-g" onClick={onReset}>
      Resetuj
    </button>
  );
}

