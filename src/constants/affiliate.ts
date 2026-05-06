function resolveAffiliateBase(): string {
  // Vite: prefer VITE_AFFILIATE_BASE_URL when available
  const viteBase =
    typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_AFFILIATE_BASE_URL
      ? (import.meta as any).env.VITE_AFFILIATE_BASE_URL
      : undefined;

  // Next / Node: allow NEXT_PUBLIC_AFFILIATE_BASE_URL
  const nextBase =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_AFFILIATE_BASE_URL
      ? process.env.NEXT_PUBLIC_AFFILIATE_BASE_URL
      : undefined;

  return viteBase ?? nextBase ?? "https://example.com/affiliate";
}

const base = resolveAffiliateBase().replace(
  /\/$/,
  "",
);

function href(slug: string) {
  return `${base}/${slug}`;
}

export const AFF: Record<
  string,
  { icon: string; image: string; href: string }
> = {
  insulation: { icon: "🧱", image: "/catalog-categories/insulation.jpeg",        href: href("insulation") },
  windows:    { icon: "🪟", image: "/catalog-categories/windows.jpeg",           href: href("windows") },
  flooring:   { icon: "🪵", image: "/catalog-categories/parquet.jpeg",           href: href("flooring") },
  lighting:   { icon: "💡", image: "/catalog-categories/lighting.jpeg",          href: href("lighting") },
  bathroom:   { icon: "🛁", image: "/catalog-categories/bathroom-furniture.jpeg", href: href("bathroom") },
  kitchen:    { icon: "🍳", image: "/catalog-categories/kitchen.jpeg",           href: href("kitchen") },
  furniture:  { icon: "🛋️", image: "/catalog-categories/bathroom-furniture.jpeg", href: href("furniture") },
  tools:      { icon: "🔧", image: "/catalog-categories/tools.jpeg",             href: href("tools") },
  roofing:    { icon: "🏚️", image: "/catalog-categories/roofing.jpeg",           href: href("roofing") },
  garden:     { icon: "🌿", image: "/catalog-categories/lawn.jpeg",              href: href("garden") },
  solar:      { icon: "☀️", image: "/catalog-categories/electrical.jpeg",        href: href("solar") },
  heating:    { icon: "🔥", image: "/catalog-categories/heating.jpeg",           href: href("heating") },
  septic:     { icon: "💧", image: "/catalog-categories/septic.jpeg",            href: href("septic") },
  fence:      { icon: "🚧", image: "/catalog-categories/fence.jpeg",             href: href("fence") },
  paint:      { icon: "🎨", image: "/catalog-categories/paint.jpeg",             href: href("paint") },
};

/* Task→affiliate mapping */
export const TASK_AFF = {
  foundations:   ["tools","insulation"],
  walls:         ["insulation","tools"],
  roof:          ["roofing","tools"],
  installations: ["heating","lighting"],
  finishing:     ["flooring","lighting","paint"],
  fullbuild:     ["insulation","windows","roofing","flooring","heating"],
  ufh:           ["heating","flooring"],
  winreplace:    ["windows"],
  flooring:      ["flooring"],
  bathreno:      ["bathroom"],
  electrical:    ["lighting"],
  plumbing:      ["bathroom"],
  insulation:    ["insulation"],
  fullreno:      ["insulation","windows","flooring","bathroom","lighting"],
  furniture:     ["furniture"],
  kitchen:       ["kitchen"],
  bathequip:     ["bathroom"],
  lighting:      ["lighting"],
  decor:         ["furniture","lighting"],
  leveling:      ["tools"],
  lawn:          ["garden"],
  irrigation:    ["garden"],
  fence:         ["fence"],
  gate:          ["fence"],
  paths:         ["tools","garden"],
  outdoorlight:  ["lighting","garden"],
};
