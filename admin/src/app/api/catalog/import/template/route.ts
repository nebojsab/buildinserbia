import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

const CATEGORIES = [
  // Stolarija
  "windows", "shutters", "mosquito_nets",
  "interior_doors", "entrance_doors", "terrace_doors", "garage_doors",
  // Kupatilo i sanitarije
  "shower_cabins", "toilets", "sinks", "faucets", "bathroom_furniture",
  "bidets", "bathtubs", "mirrors", "towel_radiators", "bathroom_accessories",
  // Kuhinja
  "kitchen_elements", "kitchen_sinks", "kitchen_faucets",
  // Keramika i podne obloge
  "tiles", "granite_tiles", "marble_tiles", "tile_adhesives", "tile_tools",
  "floor_trims", "parquet", "laminate", "vinyl_flooring",
  // Boje i fasada
  "paints", "primers", "decorative_plaster", "etics_systems",
  // Građevinski materijali
  "masonry_blocks", "cement_mortar", "reinforcement", "drywall", "drywall_profiles",
  // Drvo i ploče
  "timber_lumber", "osb_boards", "panel_boards",
  // Krov
  "roofing_tiles", "roof_membranes", "gutters",
  // Izolacija
  "insulation_thermal", "insulation_acoustic", "waterproofing",
  // Hemija
  "adhesives_sealants", "construction_chemicals",
  // ViK
  "pipes_fittings", "water_heaters", "septic_tanks", "valves", "pumps",
  // Grejanje i klima
  "boilers_heating", "radiators", "underfloor_heating", "air_conditioning",
  "heat_pumps", "ventilation",
  // Elektro
  "electrical_cables", "electrical_panels", "switches_outlets", "smart_home",
  // Alati
  "power_tools", "hand_tools", "measuring_tools", "safety_equipment",
  // Rasveta i dvorište
  "lighting", "outdoor_lighting",
  "fences", "gates", "gate_motors", "paving", "irrigation", "lawn",
];

const QUALITY_TIERS = ["lower", "mid", "higher"];

type ColDef = {
  header: string;
  key: string;
  width: number;
  required: boolean;
  note?: string;
};

const COLUMNS: ColDef[] = [
  { header: "title",             key: "title",             width: 36, required: true,  note: "Naziv proizvoda" },
  { header: "category",          key: "category",          width: 22, required: true,  note: "Jedna od dozvoljenih kategorija (dropdown)" },
  { header: "short_description", key: "short_description", width: 44, required: true,  note: "Kratki opis, 1-2 rečenice" },
  { header: "merchant_name",     key: "merchant_name",     width: 22, required: true,  note: "Naziv prodavca / prodavnice" },
  { header: "product_url",       key: "product_url",       width: 48, required: true,  note: "Puna URL adresa proizvoda (https://...)" },
  { header: "image_url",         key: "image_url",         width: 48, required: true,  note: "URL slike proizvoda (https://...)" },
  { header: "price_label",       key: "price_label",       width: 16, required: false, note: "Npr. \"EUR 320\" ili \"RSD 2.500/m²\"" },
  { header: "quality_tier",      key: "quality_tier",      width: 16, required: false, note: "lower | mid | higher  (default: mid)" },
  { header: "is_featured",       key: "is_featured",       width: 14, required: false, note: "true ili false  (default: false)" },
];

export async function GET() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "BuildInSerbia Admin";
  wb.created = new Date();

  // ── Main sheet ──────────────────────────────────────────────────────────────
  const ws = wb.addWorksheet("Proizvodi", { views: [{ state: "frozen", ySplit: 1 }] });

  ws.columns = COLUMNS.map((col) => ({
    key: col.key,
    width: col.width,
  }));

  // Header row with asterisk on required fields + styling
  const headerRow = ws.addRow(COLUMNS.map((col) => col.required ? `${col.header} *` : col.header));
  headerRow.eachCell((cell, colNum) => {
    const col = COLUMNS[colNum - 1];
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: col?.required ? "FFB45309" : "FF374151" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF1F2937" } },
    };
    if (col?.note) {
      cell.note = { texts: [{ text: col.note }] };
    }
  });
  headerRow.height = 22;

  // Data rows (2 example rows)
  const exampleRows = [
    {
      title: "PVC Prozor 140×160 dvokrilni",
      category: "windows",
      short_description: "Dvokrilni PVC prozor sa dvostrukim staklom i roletnom",
      merchant_name: "Naziv Prodavca",
      product_url: "https://example.rs/proizvod/prozor-140-160",
      image_url: "https://example.rs/images/prozor.jpg",
      price_label: "EUR 320",
      quality_tier: "mid",
      is_featured: "false",
    },
    {
      title: "Keramičke pločice 60×60 mat",
      category: "tiles",
      short_description: "Mat keramičke pločice za pod i zid 60×60 cm, rektificirane",
      merchant_name: "Naziv Prodavca",
      product_url: "https://example.rs/proizvod/plocice-60x60",
      image_url: "https://example.rs/images/plocice.jpg",
      price_label: "RSD 2.500/m²",
      quality_tier: "lower",
      is_featured: "false",
    },
  ];

  for (const data of exampleRows) {
    const row = ws.addRow(COLUMNS.map((col) => data[col.key as keyof typeof data] ?? ""));
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8F0" } };
      cell.font = { italic: true, color: { argb: "FF92400E" } };
      cell.alignment = { vertical: "middle" };
    });
    row.height = 18;
  }

  // ── Category hidden list sheet ───────────────────────────────────────────────
  const catSheet = wb.addWorksheet("_categories", { state: "veryHidden" });
  CATEGORIES.forEach((cat, i) => { catSheet.getCell(i + 1, 1).value = cat; });

  const tierSheet = wb.addWorksheet("_tiers", { state: "veryHidden" });
  QUALITY_TIERS.forEach((tier, i) => { tierSheet.getCell(i + 1, 1).value = tier; });

  // ── Data validation for rows 2–500 ──────────────────────────────────────────
  const catColLetter = "B"; // category is column 2
  const tierColLetter = "H"; // quality_tier is column 8

  for (let r = 2; r <= 500; r++) {
    ws.getCell(`${catColLetter}${r}`).dataValidation = {
      type: "list",
      formulae: [`_categories!$A$1:$A$${CATEGORIES.length}`],
      showErrorMessage: true,
      errorTitle: "Neispravna kategorija",
      error: `Izaberi jednu od: ${CATEGORIES.join(", ")}`,
    };
    ws.getCell(`${tierColLetter}${r}`).dataValidation = {
      type: "list",
      formulae: [`_tiers!$A$1:$A$${QUALITY_TIERS.length}`],
      showErrorMessage: true,
      errorTitle: "Neispravan tier",
      error: "Izaberi: lower, mid ili higher",
    };
  }

  // ── Legend row at bottom ────────────────────────────────────────────────────
  const legendRow = ws.addRow(["* Obavezno polje    |    Oranžni redovi su primeri — obriši ih pre importa"]);
  legendRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" }, size: 9 };
  ws.mergeCells(`A${legendRow.number}:I${legendRow.number}`);

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="catalog-template.xlsx"',
    },
  });
}
