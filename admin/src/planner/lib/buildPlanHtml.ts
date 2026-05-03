import type { WizardState } from "../wizard/wizardState";
import type { WizardProjectTree } from "../wizardTree/types";
import { subPriceRanges, zoneMultipliers, getQuantity } from "../wizard/priceRanges";

type Lang = "sr" | "en" | "ru";

const zoneLabel: Record<string, Record<Lang, string>> = {
  gradska:    { sr: "Gradska zona",    en: "Urban zone",    ru: "Городская зона" },
  prigradska: { sr: "Prigradska zona", en: "Suburban zone", ru: "Пригородная зона" },
  seoska:     { sr: "Seoska zona",     en: "Rural zone",    ru: "Сельская зона" },
};

function fmtNum(n: number) {
  return new Intl.NumberFormat("sr-Latn-RS").format(Math.round(n));
}
function roundTo(n: number, step: number) { return Math.round(n / step) * step; }
function niceRange(low: number, high: number): [number, number] {
  const step = low >= 5000 ? 500 : low >= 1000 ? 100 : 50;
  return [roundTo(low, step), roundTo(high, step)];
}

export function buildPlanHtml(
  state: WizardState,
  tree: WizardProjectTree,
  lang: string,
): string {
  const l: Lang = lang === "en" ? "en" : lang === "ru" ? "ru" : "sr";
  const zm = zoneMultipliers[state.location?.zoneType ?? "gradska"] ?? 1.0;
  const allSubs = tree.categories.flatMap((c) => c.subcategories);
  const selectedSubs = allSubs.filter((s) => state.selectedSubcategories.includes(s.id));

  const date = new Date().toLocaleDateString(l === "sr" ? "sr-Latn-RS" : l === "ru" ? "ru-RU" : "en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // Build cost rows
  type CostRow = { catLabel: string; subLabel: string; qty: string; range: string; low: number; high: number };
  const costRows: CostRow[] = [];
  let grandLow = 0, grandHigh = 0;

  for (const cat of tree.categories) {
    for (const sub of cat.subcategories) {
      if (!state.selectedSubcategories.includes(sub.id)) continue;
      const pr = subPriceRanges[sub.id];
      if (!pr) continue;
      const vals = (state.fieldValues[sub.id] ?? {}) as Record<string, unknown>;
      const qty = getQuantity(pr, vals);

      let low: number, high: number, qtyStr: string;
      if (pr.unit === "pausal") {
        [low, high] = niceRange(pr.low * zm, pr.high * zm);
        qtyStr = l === "sr" ? "fiksno" : l === "ru" ? "фиксно" : "fixed";
      } else if (qty !== null) {
        [low, high] = niceRange(pr.low * qty * zm, pr.high * qty * zm);
        qtyStr = `${qty} ${pr.unit === "m2" ? "m²" : (l === "sr" ? "kom" : l === "ru" ? "шт" : "pcs")}`;
      } else {
        continue;
      }
      grandLow += low;
      grandHigh += high;
      costRows.push({ catLabel: cat.label[l], subLabel: sub.label[l], qty: qtyStr, range: `${fmtNum(low)} – ${fmtNum(high)} €`, low, high });
    }
  }

  const T = {
    title:       l === "sr" ? "Plan projekta"          : l === "ru" ? "План проекта"           : "Project plan",
    generated:   l === "sr" ? "Generisano"             : l === "ru" ? "Создано"                : "Generated",
    projType:    l === "sr" ? "Tip projekta"           : l === "ru" ? "Тип проекта"            : "Project type",
    location:    l === "sr" ? "Lokacija"               : l === "ru" ? "Расположение"           : "Location",
    works:       l === "sr" ? "Izabrani radovi"        : l === "ru" ? "Выбранные работы"       : "Selected works",
    estimate:    l === "sr" ? "Procena troškova radova": l === "ru" ? "Оценка стоимости работ" : "Labour cost estimate",
    work:        l === "sr" ? "Rad"                    : l === "ru" ? "Работа"                 : "Work",
    qty:         l === "sr" ? "Kol."                   : l === "ru" ? "Кол."                   : "Qty",
    range:       l === "sr" ? "Procena (€)"            : l === "ru" ? "Оценка (€)"             : "Estimate (€)",
    total:       l === "sr" ? "Ukupno (radovi)"        : l === "ru" ? "Итого (работы)"         : "Total (labour)",
    disclaimer:  l === "sr"
      ? "Procena se odnosi na troškove radne snage. Nisu uključeni materijal, sanitarije, armature, keramika, stolarija ni projektovanje. Stvarna cena zavisi od specifičnosti projekta i izabranog izvođača."
      : l === "ru"
      ? "Оценка охватывает только стоимость работ. Не включены: материалы, сантехника, фурнитура, плитка, столярка и проектирование. Реальная цена зависит от особенностей проекта и выбранного подрядчика."
      : "Estimate covers labour costs only. Not included: materials, fixtures, tiles, joinery, or design fees. Actual cost depends on project specifics and chosen contractor.",
    note:        l === "sr" ? "Napomena"               : l === "ru" ? "Примечание"             : "Note",
    worksLabel:  l === "sr" ? "Vrsta radova"           : l === "ru" ? "Виды работ"             : "Scope of works",
  };

  const locationStr = state.location
    ? `${state.location.municipality}${state.location.zoneType ? ` · ${zoneLabel[state.location.zoneType]?.[l] ?? ""}` : ""}`
    : "—";

  const worksListHtml = selectedSubs
    .map((s) => `<li>${s.label[l]}</li>`)
    .join("");

  const costTableRows = costRows.map((r) => `
    <tr>
      <td>${r.catLabel}</td>
      <td>${r.subLabel}</td>
      <td class="num">${r.qty}</td>
      <td class="num">${r.range}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="${l}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${T.title} — BuildInSerbia</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; padding: 32px 40px; max-width: 820px; margin: 0 auto; }
  header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #e05c28; }
  .logo { font-size: 18px; font-weight: 800; letter-spacing: -.02em; color: #1a1a1a; }
  .meta { font-size: 11px; color: #888; text-align: right; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 13px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #888; margin: 24px 0 10px; }
  .summary-row { display: flex; gap: 12px; margin-bottom: 6px; }
  .summary-row .lbl { color: #888; min-width: 120px; }
  .summary-row .val { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th { background: #f5f0eb; font-weight: 700; text-align: left; padding: 7px 10px; border-bottom: 2px solid #e8e0d8; }
  td { padding: 6px 10px; border-bottom: 1px solid #f0ebe4; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .num { text-align: right; white-space: nowrap; }
  .total-row td { font-weight: 700; background: #fff4ee; border-top: 2px solid #e05c28; font-size: 13px; }
  .total-range { color: #e05c28; font-size: 15px; }
  ul { padding-left: 18px; }
  li { margin-bottom: 3px; }
  .disclaimer { margin-top: 28px; padding: 12px 16px; background: #f8f5f2; border-left: 3px solid #ccc; font-size: 11px; color: #666; line-height: 1.55; }
  .disclaimer strong { display: block; margin-bottom: 4px; color: #444; }
  footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; }
  @media print {
    body { padding: 16px 20px; }
    @page { margin: 1.5cm 2cm; size: A4; }
  }
</style>
</head>
<body>
<header>
  <div class="logo">● BuildInSerbia</div>
  <div class="meta">
    <div>${T.generated}: ${date}</div>
    <div>buildinserbia.com</div>
  </div>
</header>

<h1>${T.title}</h1>

<h2>📋 ${l === "sr" ? "Pregled projekta" : l === "ru" ? "Обзор проекта" : "Project overview"}</h2>
<div class="summary-row"><span class="lbl">${T.projType}</span><span class="val">${tree.label[l]}</span></div>
<div class="summary-row"><span class="lbl">${T.location}</span><span class="val">${locationStr}</span></div>
<div class="summary-row"><span class="lbl">${T.worksLabel}</span><span class="val">${selectedSubs.length} ${l === "sr" ? "vrsta radova" : l === "ru" ? "вид работ" : "work types"}</span></div>

<h2>🔨 ${T.works}</h2>
<ul>${worksListHtml}</ul>

${costRows.length > 0 ? `
<h2>💶 ${T.estimate}</h2>
<table>
  <thead><tr>
    <th>${l === "sr" ? "Kategorija" : l === "ru" ? "Категория" : "Category"}</th>
    <th>${T.work}</th>
    <th class="num">${T.qty}</th>
    <th class="num">${T.range}</th>
  </tr></thead>
  <tbody>
    ${costTableRows}
    <tr class="total-row">
      <td colspan="3">${T.total}</td>
      <td class="num total-range">${fmtNum(grandLow)} – ${fmtNum(grandHigh)} €</td>
    </tr>
  </tbody>
</table>` : ""}

<div class="disclaimer">
  <strong>${T.note}</strong>
  ${T.disclaimer}
</div>

<footer>
  <span>BuildInSerbia · buildinserbia.com</span>
  <span>${date}</span>
</footer>

<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;
}
