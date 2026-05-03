"use client";

import { useMemo, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { AssistantLocale } from "@/lib/assistant/types";
import { AssistantLauncher } from "./AssistantLauncher";
import { AssistantPanel } from "./AssistantPanel";

function toLocale(input: string | null): AssistantLocale {
  if (input === "en" || input === "ru" || input === "sr") return input;
  return "sr";
}

function AssistantRootInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const locale = useMemo(
    () => toLocale(searchParams.get("lang")),
    [searchParams],
  );

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      <AssistantLauncher onClick={() => setOpen(true)} locale={locale} />
      <AssistantPanel locale={locale} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function SiteAssistantRoot() {
  return (
    <Suspense fallback={null}>
      <AssistantRootInner />
    </Suspense>
  );
}
