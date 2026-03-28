const base = (import.meta.env.VITE_AFFILIATE_BASE_URL ?? "https://example.com/affiliate").replace(
  /\/$/,
  "",
);

function href(slug: string) {
  return `${base}/${slug}`;
}

export const AFF: Record<
  string,
  { icon: string; href: string }
> = {
  insulation: { icon: "🧱", href: href("insulation") },
  windows: { icon: "🪟", href: href("windows") },
  flooring: { icon: "🪵", href: href("flooring") },
  lighting: { icon: "💡", href: href("lighting") },
  bathroom: { icon: "🛁", href: href("bathroom") },
  kitchen: { icon: "🍳", href: href("kitchen") },
  furniture: { icon: "🛋️", href: href("furniture") },
  tools: { icon: "🔧", href: href("tools") },
  roofing: { icon: "🏚️", href: href("roofing") },
  garden: { icon: "🌿", href: href("garden") },
  solar: { icon: "☀️", href: href("solar") },
  heating: { icon: "🔥", href: href("heating") },
  septic: { icon: "💧", href: href("septic") },
  fence: { icon: "🚧", href: href("fence") },
  paint: { icon: "🎨", href: href("paint") },
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
