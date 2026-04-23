export type WindowEstimateMode = "exact" | "rough";

export type WindowEstimateResult = {
  openings: number;
  areaM2: number;
  lo: number;
  hi: number;
  mid: number;
};

type OpeningGroupInput = {
  type?: unknown;
  count?: unknown;
  widthCm?: unknown;
  heightCm?: unknown;
};

const OPENING_TYPE_MULTIPLIER: Record<string, number> = {
  single: 1,
  double: 1.08,
  triple: 1.16,
  balconyDoor: 1.28,
};

function toNumber(input: unknown): number | null {
  const value =
    typeof input === "number"
      ? input
      : typeof input === "string"
        ? Number(input.replace(",", "."))
        : NaN;
  if (!Number.isFinite(value)) return null;
  return value;
}

function parseAverageOpeningAreaM2(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim();
  if (!normalized) return null;
  const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*[xX*]\s*(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const widthCm = Number(match[1].replace(",", "."));
  const heightCm = Number(match[2].replace(",", "."));
  if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm) || widthCm <= 0 || heightCm <= 0) {
    return null;
  }
  return (widthCm / 100) * (heightCm / 100);
}

const MATERIAL_PRICE_PER_M2: Record<string, { min: number; max: number }> = {
  pvc: { min: 210, max: 320 },
  alu: { min: 260, max: 390 },
  wood: { min: 280, max: 430 },
};

const GLASS_MULTIPLIER: Record<string, number> = {
  double: 1,
  lowe: 1.1,
  triple: 1.18,
};

const PROFILE_MULTIPLIER: Record<string, number> = {
  standard: 1,
  premium: 1.1,
};

const HARDWARE_MULTIPLIER: Record<string, number> = {
  basic: 1,
  premium: 1.07,
  security: 1.14,
};

export function estimateWindowReplacementFromPlanner(
  details: Record<string, unknown> | undefined,
  mode: WindowEstimateMode,
): WindowEstimateResult | null {
  if (!details) return null;

  const openingGroups = Array.isArray(details.openingGroups)
    ? (details.openingGroups as OpeningGroupInput[])
    : [];
  const openingsFromGroups = openingGroups.reduce((sum, group) => {
    const count = Math.max(0, Math.round(toNumber(group.count) ?? 0));
    return sum + count;
  }, 0);
  const openings = openingsFromGroups || Math.max(0, Math.round(toNumber(details.openingsCount) ?? 0));
  if (openings <= 0) return null;

  const materialRaw = typeof details.frameMaterial === "string" ? details.frameMaterial : "pvc";
  const materialPrice = MATERIAL_PRICE_PER_M2[materialRaw] ?? MATERIAL_PRICE_PER_M2.pvc;
  const glassType = typeof details.glassType === "string" ? details.glassType : "double";
  const profileClass = typeof details.profileClass === "string" ? details.profileClass : "standard";
  const hardwareLevel = typeof details.hardwareLevel === "string" ? details.hardwareLevel : "basic";
  const glassMultiplier = GLASS_MULTIPLIER[glassType] ?? 1;
  const profileMultiplier = PROFILE_MULTIPLIER[profileClass] ?? 1;
  const hardwareMultiplier = HARDWARE_MULTIPLIER[hardwareLevel] ?? 1;
  const areaFromGroups = openingGroups.reduce((sum, group) => {
    const count = Math.max(0, Math.round(toNumber(group.count) ?? 0));
    const widthCm = toNumber(group.widthCm);
    const heightCm = toNumber(group.heightCm);
    if (!count || !widthCm || !heightCm || widthCm <= 0 || heightCm <= 0) return sum;
    const type = typeof group.type === "string" ? group.type : "single";
    const typeMultiplier = OPENING_TYPE_MULTIPLIER[type] ?? 1;
    return sum + count * (widthCm / 100) * (heightCm / 100) * typeMultiplier;
  }, 0);
  const averageAreaFromInput = parseAverageOpeningAreaM2(details.openingDimensions);
  const averageAreaM2 = averageAreaFromInput ?? (mode === "exact" ? 1.96 : 1.6);
  const areaM2 = areaFromGroups > 0 ? areaFromGroups : averageAreaM2 * openings;
  const includeFinishing = Boolean(details.includeFinishing);
  const includeRollerShutters = Boolean(details.includeRollerShutters);
  const includeMosquitoNets = Boolean(details.includeMosquitoNets);

  const specMultiplier = glassMultiplier * profileMultiplier * hardwareMultiplier;
  let lo = areaM2 * materialPrice.min * 1.08 * specMultiplier;
  let hi = areaM2 * materialPrice.max * 1.16 * specMultiplier;

  if (includeFinishing) {
    lo += openings * 18;
    hi += openings * 35;
  }
  if (includeRollerShutters) {
    lo += openings * 55;
    hi += openings * 95;
  }
  if (includeMosquitoNets) {
    lo += openings * 20;
    hi += openings * 40;
  }

  if (mode === "rough") {
    lo *= 0.92;
    hi *= 1.08;
  }

  const roundedLo = Math.round(lo);
  const roundedHi = Math.round(hi);
  return {
    openings,
    areaM2: Number(areaM2.toFixed(2)),
    lo: roundedLo,
    hi: roundedHi,
    mid: Math.round((roundedLo + roundedHi) / 2),
  };
}
