"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BetaBanner } from "./BetaBanner";
import { ContactDrawer } from "./ContactDrawer";

type Lang = "sr" | "en" | "ru";

export const OPEN_CONTACT_EVENT = "buildinserbia:open-contact";

export function openContactDrawer() {
  window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT));
}

function SiteBannerInner() {
  const searchParams = useSearchParams();
  const lang = ((searchParams.get("lang") as Lang | null) ?? "sr") as Lang;
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handler = () => setContactOpen(true);
    window.addEventListener(OPEN_CONTACT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, handler);
  }, []);

  return (
    <>
      <BetaBanner lang={lang} onContact={() => setContactOpen(true)} />
      <ContactDrawer open={contactOpen} onClose={() => setContactOpen(false)} lang={lang} />
    </>
  );
}

export function SiteBanner() {
  return (
    <Suspense fallback={null}>
      <SiteBannerInner />
    </Suspense>
  );
}
