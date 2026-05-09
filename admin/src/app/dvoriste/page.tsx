import type { Metadata } from "next";
import { PlannerLandingClient } from "@/components/PlannerLandingClient";

export const metadata: Metadata = {
  title: "Procena troškova uređenja dvorišta — BuildInSerbia",
  description:
    "Okvirna procena troškova uređenja dvorišta u Srbiji. Terase, ograde, travnjak, bazen i više — unesite detalje za vašu lokaciju.",
  openGraph: {
    title: "Uređenje dvorišta — plan i troškovi | BuildInSerbia",
    description: "Besplatna procena troškova uređenja dvorišta za vašu lokaciju u Srbiji.",
    url: "https://buildinserbia.com/dvoriste",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang = "sr" } = await searchParams;
  return <PlannerLandingClient projectType="yard" lang={lang} />;
}
