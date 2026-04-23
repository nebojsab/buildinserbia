"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { AssistantLocale } from "@/lib/assistant/types";
import { AssistantLauncher } from "./AssistantLauncher";
import { AssistantPanel } from "./AssistantPanel";

function toLocale(input: string | null): AssistantLocale {
  if (input === "en" || input === "ru" || input === "sr") return input;
  return "sr";
}

export function SiteAssistantRoot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [localeParam, setLocaleParam] = useState<string | null>(null);
  const locale = useMemo(
    () => toLocale(localeParam),
    [localeParam],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setLocaleParam(params.get("lang"));
    }
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      <AssistantLauncher onClick={() => setOpen(true)} />
      <AssistantPanel locale={locale} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
