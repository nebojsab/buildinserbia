import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CATEGORIES = [
  "windows", "shutters", "mosquito_nets", "shower_cabins", "tiles", "faucets",
  "sinks", "toilets", "bathroom_furniture", "kitchen_elements", "kitchen_sinks",
  "kitchen_faucets", "lighting", "outdoor_lighting", "fences", "gates",
  "gate_motors", "paving", "irrigation", "lawn",
].join(" | ");

const TEMPLATE = [
  "title,category,short_description,merchant_name,product_url,image_url,price_label,quality_tier,is_featured",
  `# Obavezna polja: title | category | short_description | merchant_name | product_url | image_url`,
  `# quality_tier: lower | mid | higher  (default: mid)`,
  `# is_featured: true | false  (default: false)`,
  `# Kategorije: ${CATEGORIES}`,
  `"PVC Prozor 140x160 dvokrilni","windows","Dvokrilni PVC prozor sa dvostrukim staklom","Naziv prodavca","https://example.rs/proizvod/prozor-140-160","https://example.rs/images/prozor.jpg","EUR 320","mid","false"`,
  `"Keramicke plocice 60x60 mat","tiles","Mat keramicke plocice za pod i zid 60x60cm","Naziv prodavca","https://example.rs/proizvod/plocice-60","https://example.rs/images/plocice.jpg","RSD 2500/m²","lower","false"`,
].join("\n");

export function GET() {
  return new NextResponse(TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="catalog-template.csv"',
    },
  });
}
