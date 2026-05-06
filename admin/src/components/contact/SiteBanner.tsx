"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BetaBanner } from "./BetaBanner";
import { ContactDrawer } from "./ContactDrawer";

type Lang = "sr" | "en" | "ru";

function SiteBannerInner() {
  const searchParams = useSearchParams();
  const lang = ((searchParams.get("lang") as Lang | null) ?? "sr") as Lang;
  const [contactOpen, setContactOpen] = useState(false);

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
