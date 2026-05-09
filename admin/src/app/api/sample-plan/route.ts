import { NextResponse } from "next/server";
import { buildPlanHtml } from "@/planner/lib/buildPlanHtml";
import { wizardTrees } from "@/planner/wizardTree";
import type { WizardState } from "@/planner/wizard/wizardState";

export const dynamic = "force-dynamic";

// Realistic sample plan: Renovacija, Beograd Prigradska,
// Kupatilo (kompletno, 8m²) + Podovi po prostorijama (3 sobe) + Elektrika delimična
const SAMPLE_STATE: WizardState = {
  step: 5,
  projectType: "reno",
  location: { municipality: "Beograd", zoneType: "prigradska" },
  selectedCategories: ["kupatilo", "podovi", "elektrika"],
  selectedSubcategories: [
    "kupatilo_kompletno",
    "podovi_po_prostorijama",
    "elektrika_delimicna",
  ],
  fieldValues: {
    kupatilo_kompletno: {
      povrsina: 8,
      demontaza: true,
      tip_radova: "kompletna_rekonstrukcija",
    },
    podovi_po_prostorijama: {
      prostorije: [
        { naziv: "Dnevna soba", tip: "laminat", povrsina: 22, demontaza: true, lajsne: true },
        { naziv: "Spavaća soba", tip: "laminat", povrsina: 16, demontaza: true, lajsne: true },
        { naziv: "Hodnik", tip: "keramika", povrsina: 7, demontaza: true, lajsne: false },
      ],
    },
    elektrika_delimicna: {},
  },
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") ?? "sr";
  const tree = wizardTrees["reno"];
  if (!tree) return NextResponse.json({ error: "tree not found" }, { status: 500 });

  const html = buildPlanHtml(SAMPLE_STATE, tree, lang);
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
