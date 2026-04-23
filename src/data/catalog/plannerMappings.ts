import type { PlannerCatalogMapping } from "../../types/catalog";

export const plannerMappings: PlannerCatalogMapping[] = [
  {
    taskId: "winreplace",
    categoryIds: ["windows", "shutters", "mosquito_nets"],
    priority: 100,
    fallbackCategoryIds: ["windows"],
  },
  {
    taskId: "bathreno",
    categoryIds: ["shower_cabins", "tiles", "faucets", "toilets", "sinks", "bathroom_furniture"],
    priority: 100,
    fallbackCategoryIds: ["tiles", "faucets"],
  },
  {
    taskId: "fence",
    categoryIds: ["fences"],
    priority: 90,
    fallbackCategoryIds: ["gates"],
  },
  {
    taskId: "gate",
    categoryIds: ["gates", "gate_motors"],
    priority: 95,
    fallbackCategoryIds: ["fences"],
  },
  {
    taskId: "kitchen",
    categoryIds: ["kitchen_elements", "kitchen_sinks", "kitchen_faucets", "lighting", "tiles"],
    priority: 92,
    fallbackCategoryIds: ["lighting"],
  },
  {
    taskId: "lighting",
    categoryIds: ["lighting"],
    priority: 80,
    fallbackCategoryIds: ["outdoor_lighting"],
  },
  {
    taskId: "outdoorlight",
    categoryIds: ["outdoor_lighting", "lighting"],
    priority: 85,
    fallbackCategoryIds: ["lighting"],
  },
  {
    taskId: "irrigation",
    categoryIds: ["irrigation", "lawn"],
    priority: 80,
    fallbackCategoryIds: ["lawn"],
  },
  {
    taskId: "lawn",
    categoryIds: ["lawn", "irrigation"],
    priority: 75,
    fallbackCategoryIds: ["irrigation"],
  },
  {
    taskId: "paths",
    categoryIds: ["paving"],
    priority: 70,
  },
];
