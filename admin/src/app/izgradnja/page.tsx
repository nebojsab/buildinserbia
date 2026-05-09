import type { Metadata } from "next";
import { PlannerLandingClient } from "@/components/PlannerLandingClient";

export const metadata: Metadata = {
  title: "Plan i troškovi izgradnje kuće — BuildInSerbia",
  description:
    "Procena troškova izgradnje, lista neophodnih dozvola i projektne dokumentacije za vašu lokaciju u Srbiji. Besplatno, za 3 minuta.",
  openGraph: {
    title: "Šta vas čeka pri izgradnji kuće? — BuildInSerbia",
    description: "Besplatna procena troškova gradnje i lista dozvola za vašu lokaciju u Srbiji.",
    url: "https://buildinserbia.com/izgradnja",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang = "sr" } = await searchParams;
  return <PlannerLandingClient projectType="newbuild" lang={lang} />;
}
