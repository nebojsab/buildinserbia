import {
  plannerCategoriesConfig,
  plannerFieldRegistry,
  plannerTaskDefinitions,
  type ConditionalFieldDefinition,
  type ConditionalStep,
  type PlannerParentCategoryId,
} from "./conditionalConfig";

type FieldBucket = {
  parentCommon: ConditionalFieldDefinition[];
  shared: ConditionalFieldDefinition[];
  taskSpecificByTask: Record<string, ConditionalFieldDefinition[]>;
};

export type StepFieldLayout = FieldBucket & {
  taskOrder: string[];
};

export function getFieldsForStep(
  parentId: PlannerParentCategoryId | null,
  selectedTaskIds: string[],
  step: ConditionalStep,
): StepFieldLayout {
  if (!parentId) {
    return {
      parentCommon: [],
      shared: [],
      taskSpecificByTask: {},
      taskOrder: [],
    };
  }

  const parent = plannerCategoriesConfig[parentId];
  const allowedTasks = new Set(parent.taskIds);
  const taskOrder = selectedTaskIds.filter((taskId) => allowedTasks.has(taskId));

  const seenCanonical = new Set<string>();
  const pushUnique = (arr: ConditionalFieldDefinition[], field: ConditionalFieldDefinition) => {
    if (seenCanonical.has(field.canonicalKey)) return;
    seenCanonical.add(field.canonicalKey);
    arr.push(field);
  };

  const parentCommonFieldIds =
    step === "details" ? parent.commonDetailFieldIds : parent.commonInfrastructureFieldIds;
  const parentCommon: ConditionalFieldDefinition[] = [];
  for (const fieldId of parentCommonFieldIds) {
    const field = plannerFieldRegistry[fieldId];
    if (!field || field.step !== step) continue;
    pushUnique(parentCommon, field);
  }

  const shared: ConditionalFieldDefinition[] = [];
  const taskSpecificByTask: Record<string, ConditionalFieldDefinition[]> = {};

  for (const taskId of taskOrder) {
    const taskDefinition = plannerTaskDefinitions[taskId];
    if (!taskDefinition) continue;
    const fieldIds =
      step === "details" ? taskDefinition.detailFieldIds : taskDefinition.infrastructureFieldIds;

    taskSpecificByTask[taskId] = [];
    for (const fieldId of fieldIds) {
      const field = plannerFieldRegistry[fieldId];
      if (!field || field.step !== step) continue;
      if (field.source === "shared") {
        pushUnique(shared, field);
        continue;
      }
      if (seenCanonical.has(field.canonicalKey)) continue;
      seenCanonical.add(field.canonicalKey);
      taskSpecificByTask[taskId].push(field);
    }
  }

  return {
    parentCommon,
    shared,
    taskSpecificByTask,
    taskOrder,
  };
}
