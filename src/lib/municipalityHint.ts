/**
 * Heuristic extraction of a Serbian municipality (opština) name from a free-text location
 * (Latin or Cyrillic). Used for resource hints, not as an authoritative address parse.
 */
export function extractMunicipalityHint(location: string): string | null {
  const t = location.trim();
  if (!t) return null;

  const reLatin = /[Oo]p[šs]tina\s+([^,\n]+?)(?:\s*,|\s*$)/i;
  const reCyr = /[Оо]пштина\s+([^,\n]+?)(?:\s*,|\s*$)/u;
  const m = t.match(reLatin) || t.match(reCyr);
  if (m?.[1]) {
    return m[1].trim().replace(/\s{2,}/g, " ");
  }

  // "Novi Banovci, Stara Pazova" — last segment often holds opština / grad
  const parts = t.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (last.length >= 2 && last.length < 64) return last;
  }

  return null;
}

export function municipalitySearchUrl(municipality: string, lang: "sr" | "en" | "ru"): string {
  const q =
    lang === "en"
      ? `${municipality} municipality Serbia official`
      : lang === "ru"
        ? `општина ${municipality} Сербия официальный сайт`
        : `opština ${municipality} zvanična stranica`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(q)}&ia=web`;
}
