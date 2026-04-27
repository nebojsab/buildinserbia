const FIELD_KEY_ALIASES: Record<string, string> = {
  total_area_m2: "totalPropertyAreaM2",
  totalaream2: "totalPropertyAreaM2",
  area_m2: "totalPropertyAreaM2",
  property_area: "totalPropertyAreaM2",
  property_type: "propertyType",
  propertytype: "propertyType",
  object_type: "propertyType",
  budget_band: "budgetBand",
  budgetband: "budgetBand",
  extension_area_m2: "extensionAreaM2",
  extensionaream2: "extensionAreaM2",
  lot_area_m2: "lotAreaM2",
  lotaream2: "lotAreaM2",
  municipality: "municipality",
  location_city: "location",
  city: "location",
};

export function normalizeIntakeFieldKey(fieldKey: string): string {
  const compact = fieldKey.trim().replace(/[\s-]+/g, "_");
  const lower = compact.toLowerCase();
  return FIELD_KEY_ALIASES[lower] ?? fieldKey;
}

export function normalizeIntakeFieldRecord<T>(values: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [normalizeIntakeFieldKey(key), value]),
  ) as Record<string, T>;
}
