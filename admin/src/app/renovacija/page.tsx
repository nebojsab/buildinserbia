import type { Metadata } from "next";
import { PlannerLandingClient } from "@/components/PlannerLandingClient";

export const metadata: Metadata = {
  title: "Procena troškova renovacije stana ili kuće — BuildInSerbia",
  description:
    "Okvirna procena troškova renovacije za vašu lokaciju u Srbiji. Kupatilo, podovi, fasada, instalacije i više — unesite detalje i saznajte šta vas čeka.",
  openGraph: {
    title: "Koliko košta renovacija? — BuildInSerbia",
    description: "Besplatna procena troškova renovacije za vašu lokaciju. Za 3 minuta, pre prvog poziva izvođaču.",
    url: "https://buildinserbia.com/renovacija",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang = "sr" } = await searchParams;
  return <PlannerLandingClient projectType="reno" lang={lang} />;
}
