import type { Lang } from "../translations";

/** Photon (Komoot) — OSM podaci, besplatno, bez API ključa. Ograničeno na bbox Srbije. */

const SERBIA_BBOX = "18.75,41.85,23.05,46.25";

/**
 * Javni Photon podržava samo: default, de, en, fr (ne sr/ru).
 * Za SR/RU koristimo `default` — lokalni OSM nazivi za region (npr. sr za RS), bez eng. sufiksa ("Municipality").
 */
function photonLang(lang: Lang): string {
  switch (lang) {
    case "sr":
    case "ru":
      return "default";
    default:
      return "en";
  }
}

export type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  locality?: string;
  postcode?: string;
  state?: string;
  country?: string;
  countrycode?: string;
};

function formatPhotonLabel(p: PhotonProperties): string {
  const streetLine = [p.street, p.housenumber].filter(Boolean).join(" ").trim();
  const place = (p.district || p.city || p.locality || "").trim();
  const name = (p.name || "").trim();

  if (streetLine) {
    const parts: string[] = [streetLine];
    if (place && place !== name) parts.push(place);
    else if (name && !streetLine.includes(name)) parts.push(name);
    if (p.postcode && (place || name)) parts.push(p.postcode);
    return parts.filter(Boolean).join(", ");
  }

  const parts = [name, place].filter(Boolean);
  const out: string[] = [];
  for (const x of parts) if (!out.includes(x)) out.push(x);
  return out.join(", ") || name || place;
}

export async function searchPhoton(
  query: string,
  signal: AbortSignal | undefined,
  uiLang: Lang,
): Promise<string[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "10");
  url.searchParams.set("bbox", SERBIA_BBOX);
  url.searchParams.set("lang", photonLang(uiLang));

  const acceptLang =
    uiLang === "sr"
      ? "sr-Latn,sr,en;q=0.4"
      : uiLang === "ru"
        ? "ru,en;q=0.4"
        : "en";

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": acceptLang,
    },
  });
  if (!res.ok) throw new Error(`Photon ${res.status}`);

  const data = (await res.json()) as {
    features?: Array<{ properties?: PhotonProperties }>;
  };
  const features = data.features ?? [];

  const labels: string[] = [];
  const seen = new Set<string>();
  for (const f of features) {
    const p = f.properties;
    if (!p) continue;
    const cc = (p.countrycode || "").toUpperCase();
    if (cc && cc !== "RS") continue;
    const label = formatPhotonLabel(p);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}
