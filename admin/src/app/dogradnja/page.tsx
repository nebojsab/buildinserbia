import type { Metadata } from "next";
import { PlannerLandingClient } from "@/components/PlannerLandingClient";

export const metadata: Metadata = {
  title: "Troškovi dogradnje i nadogradnje — BuildInSerbia",
  description:
    "Okvirna procena troškova dogradnje, nadogradnje sprata ili adaptacije potkrovlja za vašu lokaciju u Srbiji. Besplatno, za 3 minuta.",
  openGraph: {
    title: "Dogradnja ili nadogradnja — procena troškova | BuildInSerbia",
    description: "Besplatna procena troškova dogradnje i lista neophodnih dozvola za vašu lokaciju u Srbiji.",
    url: "https://buildinserbia.com/dogradnja",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang = "sr" } = await searchParams;
  return <PlannerLandingClient projectType="extension" lang={lang} />;
}
