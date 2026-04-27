import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  FULL_RENOVATION_TASK_KEY,
  resolveTasksForPlanSubmit,
} from "../constants/renovation";
import { generatePlan } from "../lib/generatePlan";
import type { PlanForm, ProjectType } from "../types/plan";
import { translations, type Lang } from "../translations";
import { LocationAutocomplete } from "./LocationAutocomplete";
import {
  COMMON_PROJECT_FIELDS,
  TASK_FORM_CONFIG,
  getTaskConfigs,
  type EstimateMode,
  type PlannerTaskType,
  type TaskFieldConfig,
} from "../planner/taskFormConfig";
import { getFieldsForStep } from "../planner/conditionalResolver";
import { plannerTaskDefinitions, type ConditionalFieldDefinition } from "../planner/conditionalConfig";
import { ArtifactContentRich } from "./ArtifactContentRich";
import { estimateWindowReplacementFromPlanner } from "../planner/windowEstimate";
import type { PlannerAssistantBridgeSnapshot } from "../lib/plannerAssistantBridge";
import { createInitialProjectState, orchestratePlannerIntake } from "../lib/agentic/orchestrator";
import type { ChatLine, PlannerAgentApply } from "../lib/plannerConversationalAgentLocal";
import { PlannerConversationalAgent } from "./PlannerConversationalAgent";
import type { AppLocale } from "../types/agentic";
import type { ProjectState } from "../types/agentic";
import type { PlannerIntakeResult, PlannerStatePatch } from "../types/plannerIntake";
import { runPlannerIntake } from "../api/plannerIntake";
import { IntakePrompt } from "./planner/intake/IntakePrompt";
import { IntakeReview } from "./planner/intake/IntakeReview";
import { ClarificationMiniStep } from "./planner/intake/ClarificationMiniStep";
import { IntakeDebugCard } from "./planner/intake/IntakeDebugCard";
import { applyClarificationAnswers, getClarificationQuestions } from "../lib/planner-intake/clarificationRules";
import { mapIntakeToPlannerState } from "../lib/planner-intake/mapToPlannerState";
import { trackPlannerIntakeEvent } from "../lib/planner-intake/analytics";
import { getMissingCriticalFields } from "../lib/planner/selectors/getMissingCriticalFields";

type T = (typeof translations)["sr"];

type OpeningType = "single" | "double" | "triple" | "balconyDoor";
type OpeningGroup = {
  id: string;
  type: OpeningType;
  count: number;
  widthCm: string;
  heightCm: string;
};
type TaskDetailValue = string | number | boolean | string[] | OpeningGroup[] | null;

const OPENING_TYPE_PRESETS: Record<OpeningType, { widthCm: string; heightCm: string }> = {
  single: { widthCm: "80", heightCm: "120" },
  double: { widthCm: "120", heightCm: "140" },
  triple: { widthCm: "180", heightCm: "140" },
  balconyDoor: { widthCm: "90", heightCm: "220" },
};

function createOpeningGroup(type: OpeningType = "single"): OpeningGroup {
  const preset = OPENING_TYPE_PRESETS[type];
  return {
    id: `opening-${Math.random().toString(36).slice(2, 10)}`,
    type,
    count: 1,
    widthCm: preset.widthCm,
    heightCm: preset.heightCm,
  };
}

function asNumber(input: unknown): number | null {
  const value =
    typeof input === "number"
      ? input
      : typeof input === "string"
        ? Number(input.replace(",", "."))
        : NaN;
  if (!Number.isFinite(value)) return null;
  return value;
}

function hasValue(input: TaskDetailValue | undefined): boolean {
  if (typeof input === "boolean") return true;
  if (typeof input === "number") return Number.isFinite(input);
  if (Array.isArray(input)) return input.length > 0;
  if (typeof input === "string") return input.trim().length > 0;
  return false;
}

function plannerStepToBridgeStep(
  stepIndex: number,
): NonNullable<PlannerAssistantBridgeSnapshot["currentStep"]> {
  if (stepIndex === 0) return "type";
  if (stepIndex === 1) return "tasks";
  if (stepIndex === 2) return "details";
  return "infrastructure";
}

function serializeForBridge(value: TaskDetailValue): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      typeof value[0] === "object" &&
      value[0] !== null &&
      "id" in (value[0] as object)
    ) {
      return JSON.stringify(value);
    }
    return (value as string[]).join(", ");
  }
  return null;
}

export function Planner({
  t,
  onResult,
}: {
  t: T;
  onResult: (plan: ReturnType<typeof generatePlan>, form: PlanForm) => void;
}) {
  const pw = t.planner;
  const [step, setStep] = useState(0); // 0=type, 1=tasks, 2=details, 3=infra
  const [pType, setPType] = useState<ProjectType | null>(null);
  const [selTasks, setSelTasks] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [budget] = useState(2);
  const [location,setLocation] = useState("");
  const [stage, setStage] = useState(0);
  const [userType, setUserType] = useState(0);
  const [infra, setInfra] = useState(0);
  const [commonDetails, setCommonDetails] = useState<Record<string, TaskDetailValue>>({});
  const [conditionalDetails, setConditionalDetails] = useState<Record<string, TaskDetailValue>>({});
  const [taskModes, setTaskModes] = useState<Record<string, EstimateMode>>({});
  const [taskDetails, setTaskDetails] = useState<Record<string, Record<string, TaskDetailValue>>>({});
  const [conditionalInfraDetails, setConditionalInfraDetails] = useState<Record<string, TaskDetailValue>>({});
  const [openTaskAccordions, setOpenTaskAccordions] = useState<Record<string, boolean>>({});
  const [projectGoal, setProjectGoal] = useState("");
  const [projectState, setProjectState] = useState<ProjectState>(() =>
    createInitialProjectState(`session-${Math.random().toString(36).slice(2, 10)}`),
  );
  const [plannerConversationalLines, setPlannerConversationalLines] = useState<ChatLine[]>([]);
  const [intakeStage, setIntakeStage] = useState<"entry" | "review" | "clarify" | "skipped">("entry");
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [intakeResult, setIntakeResult] = useState<PlannerIntakeResult | null>(null);
  const [intakePatch, setIntakePatch] = useState<PlannerStatePatch | null>(null);
  const [intakeSuggestedKeys, setIntakeSuggestedKeys] = useState<string[]>([]);
  const [intakeMissingKeys, setIntakeMissingKeys] = useState<string[]>([]);

  const applyPlannerStatePatch = (patch: PlannerStatePatch) => {
    if (patch.pType) setPType(patch.pType);
    if (Array.isArray(patch.selTasks) && patch.selTasks.length > 0) setSelTasks(patch.selTasks);
    if (patch.commonDetails) {
      setCommonDetails((prev) => ({ ...prev, ...patch.commonDetails } as Record<string, TaskDetailValue>));
    }
    if (patch.conditionalDetails) {
      setConditionalDetails((prev) => ({ ...prev, ...patch.conditionalDetails } as Record<string, TaskDetailValue>));
    }
    if (typeof patch.size === "string" && patch.size.trim()) setSize(patch.size.trim());
    if (typeof patch.projectGoal === "string" && patch.projectGoal.trim()) setProjectGoal(patch.projectGoal.trim());
    if (typeof patch.startStep === "number" && patch.startStep >= 0 && patch.startStep <= 3) setStep(patch.startStep);
    const suggested = [
      ...Object.keys(patch.commonDetails ?? {}),
      ...Object.keys(patch.conditionalDetails ?? {}),
    ];
    setIntakeSuggestedKeys(Array.from(new Set(suggested)));
    setIntakeMissingKeys(Array.from(new Set(patch.missingFieldKeys ?? [])));
  };

  const applyAgentSuggestion = (a: PlannerAgentApply) => {
    applyPlannerStatePatch({
      pType: a.projectType,
      selTasks: a.taskKeys,
      commonDetails: a.projectType === "reno" && a.reno ? a.reno : undefined,
      conditionalDetails: a.projectType !== "reno" && a.conditional ? a.conditional : undefined,
      size:
        typeof (a.reno?.totalPropertyAreaM2 ?? a.conditional?.totalPropertyAreaM2) === "string"
          ? String(a.reno?.totalPropertyAreaM2 ?? a.conditional?.totalPropertyAreaM2)
          : undefined,
      projectGoal: `${projectGoal.trim()}${a.goalAppend}`.trim(),
      source: "llm-intake",
    });
  };
  const [submitting, setSub] = useState(false);
  const stageOptions = pType ? pw.stagesByType[pType] : [];
  const stageHelper = pType ? pw.stageHelperByType[pType] : "";

  useEffect(() => {
    setStage(0);
  }, [pType]);

  useEffect(() => {
    if (stageOptions.length === 0) return;
    setStage((s) => Math.min(s, stageOptions.length - 1));
  }, [t.lang, stageOptions.length]);

  useEffect(() => {
    const selected = selTasks.filter(
      (task): task is PlannerTaskType => task in TASK_FORM_CONFIG,
    );
    setTaskModes((prev) => {
      const next: Record<string, EstimateMode> = {};
      for (const task of selected) {
        next[task] = prev[task] ?? "rough";
      }
      return next;
    });
    setTaskDetails((prev) => {
      const next: Record<string, Record<string, TaskDetailValue>> = {};
      for (const task of selected) {
        const existing = prev[task] ?? {};
        if (task === "winreplace") {
          const groups = Array.isArray(existing.openingGroups)
            ? (existing.openingGroups as OpeningGroup[])
            : [];
          next[task] = {
            ...existing,
            openingGroups: groups.length > 0 ? groups : [createOpeningGroup()],
          };
          continue;
        }
        next[task] = existing;
      }
      return next;
    });
    setOpenTaskAccordions((prev) => {
      const next: Record<string, boolean> = {};
      for (const task of selected) {
        next[task] = prev[task] ?? true;
      }
      return next;
    });
  }, [selTasks.join("|")]);

  const pct = ((step + 1) / 4) * 100;

  const taskList = pType ? pw.tasks[pType] || [] : [];
  const renoGranularKeys = taskList
    .map((x) => x.k)
    .filter((k) => k !== FULL_RENOVATION_TASK_KEY);

  const fullRenoShortcutActive =
    pType === "reno" &&
    selTasks.length === 1 &&
    selTasks[0] === FULL_RENOVATION_TASK_KEY;

  const detailsFieldLayout = getFieldsForStep(pType, selTasks, "details");
  const infraFieldLayout = getFieldsForStep(pType, selTasks, "infrastructure");
  const selectedTaskTypes = detailsFieldLayout.taskOrder
    .map((task) => plannerTaskDefinitions[task]?.taskFormTaskKey)
    .filter((task): task is PlannerTaskType => Boolean(task));
  const commonFieldKeySet = new Set(
    [...detailsFieldLayout.parentCommon, ...detailsFieldLayout.shared].map((field) => field.key),
  );
  const commonFieldConfigs = COMMON_PROJECT_FIELDS.filter((field) =>
    commonFieldKeySet.has(field.key),
  );
  const selectedTaskConfigs = getTaskConfigs(selectedTaskTypes);
  const conditionalInfraFields = [
    ...infraFieldLayout.parentCommon,
    ...infraFieldLayout.shared,
    ...Object.values(infraFieldLayout.taskSpecificByTask).flat(),
  ];
  const conditionalDetailFields = [
    ...detailsFieldLayout.parentCommon,
    ...detailsFieldLayout.shared,
    ...Object.values(detailsFieldLayout.taskSpecificByTask).flat(),
  ];
  const conditionalDetailCommonFields = [
    ...detailsFieldLayout.parentCommon,
    ...detailsFieldLayout.shared,
  ];
  const intakeCriticalMissing = getMissingCriticalFields(intakeResult);
  const conditionalInfraSignature = conditionalInfraFields.map((field) => field.id).join("|");
  const conditionalDetailSignature = conditionalDetailFields.map((field) => field.id).join("|");

  const handleTaskClick = (k: string) => {
    if (pType !== "reno") {
      setSelTasks((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
      return;
    }
    if (k === FULL_RENOVATION_TASK_KEY) {
      if (fullRenoShortcutActive) {
        setSelTasks([]);
      } else {
        setSelTasks([FULL_RENOVATION_TASK_KEY]);
      }
      return;
    }
    if (fullRenoShortcutActive) {
      setSelTasks([k]);
      return;
    }
    setSelTasks((p) => {
      const base = p.filter((x) => x !== FULL_RENOVATION_TASK_KEY);
      return base.includes(k) ? base.filter((x) => x !== k) : [...base, k];
    });
  };

  const canNext0 = !!pType && projectGoal.trim().length >= 10;
  const canNext1 = selTasks.length > 0;

  const localized = (copy: Record<Lang, string>) => copy[t.lang as Lang] ?? copy.sr;
  const intakeLabels = (pw as typeof pw & { intake?: Record<string, string> }).intake;
  const intakeCategoryLabelMap: Record<string, string> = Object.fromEntries(
    pw.projectTypes.map((entry) => [entry.k, entry.label]),
  );
  const intakeTaskLabelMap: Record<string, string> = Object.fromEntries(
    Object.values(pw.tasks)
      .flat()
      .map((entry) => [entry.k, entry.label]),
  );
  const intakeTaskOrderMap: Record<string, number> = Object.fromEntries(
    Object.values(pw.tasks)
      .flat()
      .map((entry, index) => [entry.k, index]),
  );
  const intakeFieldLabelMap: Record<string, string> = {
    totalPropertyAreaM2:
      t.lang === "sr" ? "Ukupna površina (m²)" : t.lang === "en" ? "Total area (m²)" : "Общая площадь (м²)",
    extensionAreaM2:
      t.lang === "sr" ? "Površina nadogradnje (m²)" : t.lang === "en" ? "Extension area (m²)" : "Площадь надстройки (м²)",
    lotAreaM2:
      t.lang === "sr" ? "Površina placa (m²)" : t.lang === "en" ? "Lot area (m²)" : "Площадь участка (м²)",
    propertyType:
      t.lang === "sr" ? "Tip objekta" : t.lang === "en" ? "Property type" : "Тип объекта",
    budgetBand:
      t.lang === "sr" ? "Budžetski okvir" : t.lang === "en" ? "Budget band" : "Бюджетный диапазон",
    location:
      t.lang === "sr" ? "Lokacija" : t.lang === "en" ? "Location" : "Локация",
    municipality:
      t.lang === "sr" ? "Opština" : t.lang === "en" ? "Municipality" : "Муниципалитет",
  };
  const mixedScopeHintFor = (result: PlannerIntakeResult | null): string | undefined => {
    if (!result) return undefined;
    const source = `${result.rawUserGoal} ${result.detectedIntent}`.toLowerCase();
    const mentionsReno = /renov|reno|adapt|remont|kupatil|proz/.test(source);
    const mentionsExtension = /nadograd|dograd|extension|aneks|sprat/.test(source);
    if (!(mentionsReno && mentionsExtension)) return undefined;
    if (result.parentCategory !== "extension") return undefined;
    return t.lang === "sr"
      ? "Detektovana je kombinacija nadogradnje i renoviranja. Startujemo od nadogradnje; renoviranje možete odmah dodati u sledećem koraku."
      : t.lang === "en"
        ? "A mixed extension + renovation scope is detected. We start from extension; you can add renovation tasks in the next step."
        : "Обнаружена комбинация надстройки и ремонта. Стартуем с надстройки; задачи ремонта можно добавить на следующем шаге.";
  };
  const intakeTaskLabelsFromKeys = (taskKeys: string[]) =>
    taskKeys.map((key) => intakeTaskLabelMap[key] ?? key);
  const isIntakeSuggested = (key: string) => intakeSuggestedKeys.includes(key);
  const isIntakeMissing = (key: string) => intakeMissingKeys.includes(key);

  const runIntake = async () => {
    const goal = projectGoal.trim();
    if (goal.length < 10) return;
    setIntakeLoading(true);
    setIntakeError(null);
    trackPlannerIntakeEvent("intake_started", { locale: t.lang as Lang });
    try {
      const response = await runPlannerIntake(goal, t.lang as Lang);
      setIntakeResult(response.intake);
      setIntakePatch(response.plannerPatch);
      setIntakeStage("review");
      trackPlannerIntakeEvent("intake_reviewed", {
        locale: t.lang as Lang,
        confidence: response.intake.confidence.overall,
        parentCategory: response.intake.parentCategory,
        parentCategoryLabel:
          intakeCategoryLabelMap[response.intake.parentCategory] ?? response.intake.parentCategory,
        taskCount: response.intake.childTasks.length,
        taskKeys: response.intake.childTasks,
        taskLabels: intakeTaskLabelsFromKeys(response.intake.childTasks),
      });
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Intake failed";
      if (rawMessage.includes("not available")) {
        setIntakeError(
          t.lang === "sr"
            ? "Intake servis trenutno nije dostupan. Možete kliknuti „Preskoči i idi na planner“."
            : t.lang === "en"
              ? "Intake service is currently unavailable. You can click “Skip and open planner”."
              : "Сервис intake сейчас недоступен. Нажмите «Пропустить и открыть planner».",
        );
      } else {
        setIntakeError(rawMessage);
      }
    } finally {
      setIntakeLoading(false);
    }
  };

  const confirmIntakeAndContinue = () => {
    if (intakeResult) {
      const pendingClarifications = getClarificationQuestions(intakeResult);
      if (pendingClarifications.length > 0) {
        setIntakeStage("clarify");
        trackPlannerIntakeEvent("intake_clarification_opened", { locale: t.lang as Lang });
        return;
      }
    }
    if (intakePatch) applyPlannerStatePatch(intakePatch);
    trackPlannerIntakeEvent("intake_confirmed", {
      locale: t.lang as Lang,
      parentCategory: intakeResult?.parentCategory,
      parentCategoryLabel: intakeResult
        ? intakeCategoryLabelMap[intakeResult.parentCategory] ?? intakeResult.parentCategory
        : undefined,
      taskCount: intakeResult?.childTasks.length,
      taskKeys: intakeResult?.childTasks,
      taskLabels: intakeResult ? intakeTaskLabelsFromKeys(intakeResult.childTasks) : undefined,
    });
    setIntakeStage("skipped");
  };

  const continueFromClarifications = (answers: Record<string, string>) => {
    if (!intakeResult) {
      setIntakeStage("skipped");
      return;
    }
    const enriched = applyClarificationAnswers(intakeResult, answers);
    const patch = mapIntakeToPlannerState(enriched);
    setIntakeResult(enriched);
    setIntakePatch(patch);
    applyPlannerStatePatch(patch);
    trackPlannerIntakeEvent("intake_clarification_completed", {
      locale: t.lang as Lang,
      parentCategory: enriched.parentCategory,
      parentCategoryLabel: intakeCategoryLabelMap[enriched.parentCategory] ?? enriched.parentCategory,
      taskCount: enriched.childTasks.length,
      taskKeys: enriched.childTasks,
      taskLabels: intakeTaskLabelsFromKeys(enriched.childTasks),
    });
    setIntakeStage("skipped");
  };

  const setTaskFieldValue = (
    task: PlannerTaskType,
    key: string,
    value: TaskDetailValue,
  ) => {
    setTaskDetails((prev) => ({
      ...prev,
      [task]: {
        ...(prev[task] ?? {}),
        [key]: value,
      },
    }));
  };

  const isRequiredFieldMissing = (
    field: TaskFieldConfig,
    value: TaskDetailValue | undefined,
    mode: EstimateMode,
  ) => {
    if (field.importance !== "required") return false;
    if (mode === "rough" && field.unknownAllowed) return false;
    return !hasValue(value);
  };

  const isCommonFieldMissing = (
    key: string,
    value: TaskDetailValue | undefined,
    visibleWhen: "always" | "needsTotalArea",
  ) => {
    const needsTotal = selectedTaskConfigs.some((task) => task.requiresTotalArea);
    if (visibleWhen === "needsTotalArea" && !needsTotal) return false;
    if (key === "budgetBand") return false;
    return !hasValue(value);
  };

  const isConditionalDetailMissing = (
    field: ConditionalFieldDefinition,
    value: TaskDetailValue | undefined,
  ) => {
    if (field.importance !== "required") return false;
    if (field.kind === "toggle") return value === undefined || value === null;
    return !hasValue(value);
  };

  const openingGroups = Array.isArray(taskDetails.winreplace?.openingGroups)
    ? (taskDetails.winreplace?.openingGroups as OpeningGroup[])
    : [];
  const windowGroupOpenings = openingGroups.reduce(
    (sum, group) => sum + Math.max(0, Number(group.count || 0)),
    0,
  );
  const windowGroupsMissingExact =
    (taskModes.winreplace ?? "rough") === "exact" &&
    openingGroups.some(
      (group) =>
        !group.widthCm.trim() ||
        !group.heightCm.trim() ||
        Number(group.count) <= 0,
    );

  const setWindowOpeningGroups = (updater: (groups: OpeningGroup[]) => OpeningGroup[]) => {
    setTaskDetails((prev) => {
      const current = Array.isArray(prev.winreplace?.openingGroups)
        ? (prev.winreplace?.openingGroups as OpeningGroup[])
        : [];
      return {
        ...prev,
        winreplace: {
          ...(prev.winreplace ?? {}),
          openingGroups: updater(current),
        },
      };
    });
  };

  const deriveRenoSize = (): string => {
    const totalArea = asNumber(commonDetails.totalPropertyAreaM2);
    if (totalArea && totalArea > 0) return String(Math.round(totalArea));

    const areaCandidates: number[] = [];
    for (const task of selectedTaskTypes) {
      const details = taskDetails[task] ?? {};
      const keys = [
        "heatedAreaM2",
        "floorAreaM2",
        "insulationAreaM2",
        "bathroomFloorAreaM2",
      ];
      for (const key of keys) {
        const n = asNumber(details[key]);
        if (n && n > 0) areaCandidates.push(n);
      }
    }

    if (areaCandidates.length > 0) {
      const inferred = Math.max(...areaCandidates);
      return String(Math.round(Math.max(20, Math.min(400, inferred))));
    }

    const winOpeningsFromGroups = openingGroups.reduce(
      (sum, group) => sum + Math.max(0, Number(group.count || 0)),
      0,
    );
    const winOpenings = winOpeningsFromGroups || asNumber(taskDetails.winreplace?.openingsCount);
    if (winOpenings && winOpenings > 0) {
      return String(Math.round(Math.max(30, Math.min(250, winOpenings * 12))));
    }

    const electricalPoints = asNumber(taskDetails.electrical?.electricalPointsCount);
    const plumbingPoints = asNumber(taskDetails.plumbing?.plumbingPointsCount);
    const points = (electricalPoints ?? 0) + (plumbingPoints ?? 0);
    if (points > 0) {
      return String(Math.round(Math.max(25, Math.min(300, points * 2))));
    }

    return size || "100";
  };

  const deriveConditionalSize = (): string => {
    const areaCandidateKeys = [
      "totalPropertyAreaM2",
      "yardLawnAreaM2",
    ];
    for (const key of areaCandidateKeys) {
      const n = asNumber(conditionalDetails[key]);
      if (n && n > 0) return String(Math.round(n));
    }
    return size || "100";
  };

  const canNext2 = (() => {
    if (pType !== "reno") {
      if (!location.trim()) return false;
      return conditionalDetailFields.every(
        (field) => !isConditionalDetailMissing(field, conditionalDetails[field.id]),
      );
    }
    const commonMissing = commonFieldConfigs.some((field) =>
      isCommonFieldMissing(field.key, commonDetails[field.key], field.visibleWhen),
    );
    if (commonMissing) return false;
    if (!location.trim()) return false;

    for (const task of selectedTaskConfigs) {
      const details = taskDetails[task.task] ?? {};
      const mode = taskModes[task.task] ?? "rough";
      if (task.task === "winreplace") {
        if (openingGroups.length === 0 || windowGroupOpenings <= 0) return false;
        if (windowGroupsMissingExact) return false;
      }
      for (const section of task.sections) {
        for (const field of section.fields) {
          if (isRequiredFieldMissing(field, details[field.key], mode)) return false;
        }
      }
    }
    return true;
  })();
  const canSubmitInfra = true;

  useEffect(() => {
    setConditionalInfraDetails((prev) => {
      const next: Record<string, TaskDetailValue> = {};
      for (const field of conditionalInfraFields) {
        if (field.kind === "toggle") {
          next[field.id] = typeof prev[field.id] === "boolean" ? prev[field.id] : false;
          continue;
        }
        if (prev[field.id] !== undefined) {
          next[field.id] = prev[field.id];
        }
      }
      return next;
    });
  }, [conditionalInfraSignature]);

  useEffect(() => {
    setConditionalDetails((prev) => {
      const next: Record<string, TaskDetailValue> = {};
      for (const field of conditionalDetailFields) {
        if (field.kind === "toggle") {
          next[field.id] = typeof prev[field.id] === "boolean" ? prev[field.id] : false;
          continue;
        }
        if (prev[field.id] !== undefined) {
          next[field.id] = prev[field.id];
        }
      }
      return next;
    });
  }, [conditionalDetailSignature]);

  const windowEstimatePreview = estimateWindowReplacementFromPlanner(
    (taskDetails.winreplace as Record<string, unknown> | undefined) ?? undefined,
    taskModes.winreplace ?? "rough",
  );

  useEffect(() => {
    const lang = t.lang;
    const locale: PlannerAssistantBridgeSnapshot["locale"] =
      lang === "sr" || lang === "en" || lang === "ru" ? lang : "sr";

    const partial: Record<string, string | number | boolean | null> = {
      location: location.trim() || null,
    };
    const visible: string[] = ["location"];

    if (!pType) {
      visible.push("projectType");
      const snapshot: PlannerAssistantBridgeSnapshot = {
        locale,
        currentPage: "/",
        currentStep: plannerStepToBridgeStep(step),
        selectedProjectType: undefined,
        selectedTasks: [],
        visibleFields: visible,
        partiallyFilledValues: partial,
        estimateModeByTask: {},
      };
      window.__buildInSerbiaPlannerContext = snapshot;
      return () => {
        window.__buildInSerbiaPlannerContext = undefined;
      };
    }

    if (pType === "reno") {
      const taskCfg = getTaskConfigs(selectedTaskTypes);
      for (const f of commonFieldConfigs) {
        visible.push(`common.${f.key}`);
      }
      for (const task of taskCfg) {
        for (const section of task.sections) {
          for (const field of section.fields) {
            if (
              task.task === "winreplace" &&
              (field.key === "openingsCount" || field.key === "openingDimensions")
            ) {
              continue;
            }
            visible.push(`${task.task}.${field.key}`);
          }
        }
        if (task.task === "winreplace") {
          visible.push("winreplace.openingGroups");
        }
      }
      for (const [k, v] of Object.entries(commonDetails)) {
        partial[`common.${k}`] = serializeForBridge(v);
      }
      for (const taskKey of selectedTaskTypes) {
        const details = taskDetails[taskKey] ?? {};
        for (const [k, v] of Object.entries(details)) {
          partial[`${taskKey}.${k}`] = serializeForBridge(v as TaskDetailValue);
        }
      }
    } else {
      for (const field of conditionalDetailFields) {
        visible.push(`details.${field.id}`);
      }
      visible.push("stage", "userType");
      if (step >= 3) visible.push("infra");
      for (const [fieldId, value] of Object.entries(conditionalDetails)) {
        partial[`details.${fieldId}`] = serializeForBridge(value as TaskDetailValue);
      }
      partial.stage = stage;
      partial.userType = userType;
      partial.infra = infra;
    }
    if (step >= 3) {
      for (const field of conditionalInfraFields) {
        visible.push(`infra.${field.id}`);
      }
      for (const [fieldId, value] of Object.entries(conditionalInfraDetails)) {
        partial[`infra.${fieldId}`] = serializeForBridge(value as TaskDetailValue);
      }
    }

    const snapshot: PlannerAssistantBridgeSnapshot = {
      locale,
      currentPage: "/",
      currentStep: plannerStepToBridgeStep(step),
      selectedProjectType: pType,
      selectedTasks: [...selTasks],
      visibleFields: visible,
      partiallyFilledValues: partial,
      estimateModeByTask: { ...taskModes },
    };
    window.__buildInSerbiaPlannerContext = snapshot;

    return () => {
      window.__buildInSerbiaPlannerContext = undefined;
    };
  }, [
    step,
    pType,
    selTasks,
    location,
    commonDetails,
    taskDetails,
    taskModes,
    t.lang,
    size,
    budget,
    stage,
    userType,
    infra,
    conditionalInfraDetails,
    conditionalDetails,
    conditionalInfraFields,
    conditionalDetailFields,
    selectedTaskTypes,
    commonFieldConfigs,
  ]);

  const doSubmit = () => {
    if (!pType) return;
    setSub(true);
    const budgetBand =
      pType === "reno"
        ? String(commonDetails.budgetBand ?? "")
        : String(conditionalDetails.budgetBand ?? "");
    const budgetFromBand =
      budgetBand === "low" ? 1 : budgetBand === "mid" ? 2 : budgetBand === "high" ? 3 : budget;
    const resolvedLocation = location;
    const resolvedSize = pType === "reno" ? deriveRenoSize() : deriveConditionalSize();
    const orchestration = orchestratePlannerIntake(projectState, {
      goal: projectGoal.trim(),
      projectType: pType,
      location: resolvedLocation,
      tasks: resolveTasksForPlanSubmit(pType, selTasks, renoGranularKeys),
      stage,
      budget: budgetFromBand,
      locale: t.lang as AppLocale,
    });
    setProjectState(orchestration.state);

    const form: PlanForm = {
      projectType: pType,
      tasks: resolveTasksForPlanSubmit(pType, selTasks, renoGranularKeys),
      size: resolvedSize,
      budget: budgetFromBand,
      stage,
      userType,
      infra,
      location: resolvedLocation,
      details:
        pType === "reno"
          ? {
              commonProjectDetails: commonDetails,
              taskModes,
              taskDetailsByType: taskDetails,
              conditionalDetailValues: conditionalDetails,
              infrastructureDetails: conditionalInfraDetails,
              conditionalParent: pType,
              conditionalTaskSelection: selTasks,
              agentProjectState: orchestration.state,
              plannerConversational: plannerConversationalLines,
            }
          : {
              conditionalDetailValues: conditionalDetails,
              infrastructureDetails: conditionalInfraDetails,
              conditionalParent: pType,
              conditionalTaskSelection: selTasks,
              agentProjectState: orchestration.state,
              plannerConversational: plannerConversationalLines,
            },
    };
    setTimeout(() => {
      setSub(false);
      onResult(generatePlan(form, t.lang as Lang), form);
    }, 1000);
  };

  const S = (children: ReactNode, delay = 0) => (
    <div className="fu" style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );

  if (intakeStage !== "skipped" && intakeLabels) {
    return (
      <div>
        <IntakeDebugCard lang={t.lang as Lang} />
        {intakeStage === "entry" ? (
          <IntakePrompt
            value={projectGoal}
            loading={intakeLoading}
            error={intakeError}
            onChange={setProjectGoal}
            onSubmit={() => void runIntake()}
            onSkip={() => setIntakeStage("skipped")}
            labels={{
              title: intakeLabels.title,
              subtitle: intakeLabels.subtitle,
              placeholder: intakeLabels.placeholder,
              submit: intakeLabels.submit,
              skip: intakeLabels.skip,
              loading: intakeLabels.loading,
              error: intakeLabels.error,
            }}
          />
        ) : intakeStage === "review" && intakeResult ? (
          <IntakeReview
            result={intakeResult}
            categoryLabelMap={intakeCategoryLabelMap}
            taskLabelMap={intakeTaskLabelMap}
            taskOrderMap={intakeTaskOrderMap}
            fieldLabelMap={intakeFieldLabelMap}
            mixedScopeHint={mixedScopeHintFor(intakeResult)}
            onConfirm={confirmIntakeAndContinue}
            onEdit={() => setIntakeStage("entry")}
            onFallback={() => {
              trackPlannerIntakeEvent("intake_fallback", {
                locale: t.lang as Lang,
                parentCategory: intakeResult.parentCategory,
                parentCategoryLabel:
                  intakeCategoryLabelMap[intakeResult.parentCategory] ?? intakeResult.parentCategory,
                taskCount: intakeResult.childTasks.length,
                taskKeys: intakeResult.childTasks,
                taskLabels: intakeTaskLabelsFromKeys(intakeResult.childTasks),
              });
              setIntakeStage("skipped");
            }}
            labels={{
              title: intakeLabels.reviewTitle,
              understood: intakeLabels.understood,
              detectedParent: intakeLabels.detectedParent,
              detectedTasks: intakeLabels.detectedTasks,
              extractedValues: intakeLabels.extractedValues,
              missing: intakeLabels.missing,
              assumptions: intakeLabels.assumptions,
              confidence: intakeLabels.confidence,
              confirm: intakeLabels.confirm,
              edit: intakeLabels.edit,
              fallback: intakeLabels.fallback,
            }}
          />
        ) : intakeStage === "clarify" && intakeResult ? (
          <ClarificationMiniStep
            questions={getClarificationQuestions(intakeResult)}
            onContinue={continueFromClarifications}
            onSkip={() => {
              if (intakePatch) applyPlannerStatePatch(intakePatch);
              trackPlannerIntakeEvent("intake_confirmed", {
                locale: t.lang as Lang,
                parentCategory: intakeResult?.parentCategory,
                parentCategoryLabel: intakeResult
                  ? intakeCategoryLabelMap[intakeResult.parentCategory] ?? intakeResult.parentCategory
                  : undefined,
                taskCount: intakeResult?.childTasks.length,
                taskKeys: intakeResult?.childTasks,
                taskLabels: intakeResult ? intakeTaskLabelsFromKeys(intakeResult.childTasks) : undefined,
              });
              setIntakeStage("skipped");
            }}
            labels={{
              title: intakeLabels.clarifyTitle,
              subtitle: intakeLabels.clarifySubtitle,
              answerPlaceholder: intakeLabels.clarifyPlaceholder,
              continue: intakeLabels.clarifyContinue,
              skip: intakeLabels.clarifySkip,
            }}
          />
        ) : null}
      </div>
    );
  }

  return(
    <div>
      <IntakeDebugCard lang={t.lang as Lang} />
      {/* Step indicator */}
      <div className="step-ind">
        {pw.stepLabels.map((lbl,i)=>(
          <Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div className="step-dot" style={{
                background:step>i?"var(--acc)":step===i?"var(--ink)":"var(--bgw)",
                border:`2px solid ${step>=i?"var(--acc)":"var(--bdr2)"}`,
                color:step>i||step===i?"#fff":"var(--ink4)",
                width:26,height:26,fontSize:10,fontWeight:700,
              }}>{step>i?"✓":i+1}</div>
              <span style={{fontSize:10,fontWeight:500,color:step===i?"var(--acc)":step>i?"var(--ink3)":"var(--ink4)",fontFamily:"var(--sans)",whiteSpace:"nowrap"}}>{lbl}</span>
            </div>
            {i<pw.stepLabels.length-1&&(
              <div className="step-line" style={{background:step>i?"var(--acc)":"var(--bdr)"}}/>
            )}
          </Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="pbar"><div className="pfill" style={{width:`${pct}%`}}/></div>

      {/* STEP 0: Project type */}
      {step===0&&S(
        <div>
          <h3 style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:22,marginTop:0,lineHeight:1.3}}>{pw.title}</h3>
          <div style={{ marginBottom: 16 }}>
            <label className="flabel">
              {pw.goalLabel} *
            </label>
            <textarea
              className="finput"
              rows={3}
              value={projectGoal}
              placeholder={pw.goalPlaceholder}
              onChange={(event) => setProjectGoal(event.target.value)}
              style={{
                width: "100%",
                resize: "vertical",
                minHeight: 84,
              }}
            />
            <p style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink4)" }}>
              {pw.goalHelper}
            </p>
            {"conversationalAgent" in pw && pw.conversationalAgent ? (
              <PlannerConversationalAgent
                lang={t.lang as Lang}
                projectGoal={projectGoal}
                onApplySuggestion={applyAgentSuggestion}
                onTranscript={setPlannerConversationalLines}
                labels={pw.conversationalAgent}
              />
            ) : null}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="task-g">
            {pw.projectTypes.map(pt=>(
              <button key={pt.k}
                onClick={() => {
                  setPType(pt.k as ProjectType);
                  setSelTasks([]);
                }}
                style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px",border:`2px solid ${pType===pt.k?"var(--acc)":"var(--bdr)"}`,borderRadius:"var(--rl)",background:pType===pt.k?"var(--accbg)":"var(--bg)",cursor:"pointer",transition:"all .15s",textAlign:"left"}}>
                <span style={{fontSize:28}}>{pt.icon}</span>
                <span style={{fontSize:14,fontWeight:600,color:pType===pt.k?"var(--acc)":"var(--ink)",fontFamily:"var(--sans)"}}>{pt.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink3)", lineHeight: 1.5, maxWidth: "min(100%, 420px)" }}>
              {!canNext0 && projectGoal.trim().length >= 10 && !pType
                ? pw.nextNeedProjectType
                : !canNext0 && pType && projectGoal.trim().length < 10
                  ? pw.nextNeedGoalShort
                  : null}
            </p>
            <button className="btn-p" onClick={() => setStep(1)} disabled={!canNext0} style={{ fontSize: 14, flexShrink: 0 }} type="button">
              {pw.next}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Task selection */}
      {step===1&&S(
        <div>
          <h3 style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:6,marginTop:0,lineHeight:1.3}}>
            {pw.projectTypes.find(p=>p.k===pType)?.icon} {pw.projectTypes.find(p=>p.k===pType)?.label}
          </h3>
          <p style={{fontSize:13.5,color:"var(--ink3)",marginBottom:22,fontFamily:"var(--sans)"}}>{pw.selectHint}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="task-g">
            {taskList.map((tk) => {
              const selected =
                pType === "reno" && fullRenoShortcutActive
                  ? tk.k === FULL_RENOVATION_TASK_KEY
                  : selTasks.includes(tk.k);
              const muted =
                pType === "reno" &&
                fullRenoShortcutActive &&
                tk.k !== FULL_RENOVATION_TASK_KEY;
              return (
                <div
                  key={tk.k}
                  className={`task-opt${selected ? " sel" : ""}${muted ? " muted" : ""}`}
                  onClick={() => handleTaskClick(tk.k)}
                  style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      width: "100%",
                    }}
                  >
                    <span className="task-icon">{tk.icon}</span>
                    <span className="task-label" style={{ flex: 1, minWidth: 0 }}>
                      {tk.label}
                    </span>
                    <div className="task-chk">
                      {selected ? (
                        <span style={{ fontSize: 10, color: "#fff" }}>✓</span>
                      ) : null}
                    </div>
                  </div>
                  {tk.k === FULL_RENOVATION_TASK_KEY ? (
                    <p
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink3)",
                        lineHeight: 1.45,
                        fontFamily: "var(--sans)",
                        margin: 0,
                        paddingLeft: 28,
                      }}
                    >
                      {pw.fullRenoHint}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
            <button className="btn-g" onClick={()=>setStep(0)}>{pw.back}</button>
            <button className="btn-p" onClick={()=>setStep(2)} disabled={!canNext1} style={{fontSize:14}}>{pw.next}</button>
          </div>
        </div>
      )}

      {/* STEP 2: Details */}
      {step===2&&S(
        <div>
          <h3 style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:22,marginTop:0,lineHeight:1.3}}>
            {t.lang==="sr"?"Detalji projekta":t.lang==="en"?"Project details":"Детали проекта"}
          </h3>
          {intakeSuggestedKeys.length > 0 ? (
            <div className="intake-note">
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink2)" }}>
                {t.lang === "sr"
                  ? "Označeno je šta je AI predložio. Proverite i korigujte po potrebi."
                  : t.lang === "en"
                    ? "AI-suggested values are highlighted. Please review and adjust as needed."
                    : "Подсвечены значения, предложенные AI. Проверьте и при необходимости исправьте."}
              </p>
              {intakeCriticalMissing.length > 0 ? (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink3)" }}>
                  {t.lang === "sr"
                    ? "Prioritetno dopunite:"
                    : t.lang === "en"
                      ? "Please complete first:"
                      : "Сначала заполните:"}{" "}
                  {intakeCriticalMissing.slice(0, 4).join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
          {pType === "reno" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <section className="card" style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", marginBottom: 10 }}>
                  {t.lang === "sr" ? "Osnovni podaci projekta" : t.lang === "en" ? "Common project details" : "Obshchie dannye proekta"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="res-2col">
                  {commonFieldConfigs.map((field) => {
                    const value = commonDetails[field.key];
                    const missing = isCommonFieldMissing(field.key, value, field.visibleWhen);
                    const requiredMsg =
                      t.lang === "sr" ? "Obavezno polje" : t.lang === "en" ? "Required field" : "Obyazatelnoe pole";
                    return (
                      <div key={field.key}>
                        <label className="flabel">
                          {localized(field.label)}
                          {field.importance === "required" ? " *" : ""}
                          {isIntakeSuggested(field.key) ? (
                            <span className="intake-field-tag">
                              {t.lang === "sr" ? " predloženo" : t.lang === "en" ? " suggested" : " предложено"}
                            </span>
                          ) : null}
                        </label>
                        {field.kind === "select" ? (
                          <select
                            className={`fselect${isIntakeSuggested(field.key) ? " intake-suggested" : ""}${isIntakeMissing(field.key) ? " intake-missing" : ""}`}
                            value={String(value ?? "")}
                            title={missing ? requiredMsg : undefined}
                            onChange={(event) =>
                              setCommonDetails((prev) => ({
                                ...prev,
                                [field.key]: event.target.value,
                              }))
                            }
                          >
                            <option value="">
                              {t.lang === "sr" ? "Izaberi" : t.lang === "en" ? "Select" : "Vyberite"}
                            </option>
                            {(field.options ?? []).map((option) => (
                              <option key={option.value} value={option.value}>
                                {localized(option.label)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={`finput${isIntakeSuggested(field.key) ? " intake-suggested" : ""}${isIntakeMissing(field.key) ? " intake-missing" : ""}`}
                            type={field.kind === "number" ? "number" : "text"}
                            value={String(value ?? "")}
                            placeholder={field.placeholder ? localized(field.placeholder) : ""}
                            title={missing ? requiredMsg : undefined}
                            onChange={(event) =>
                              setCommonDetails((prev) => ({
                                ...prev,
                                [field.key]:
                                  field.kind === "number" ? event.target.value : event.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 12 }}>
                  <label className="flabel">{pw.fields.location.label} *</label>
                  <div
                    title={
                      !location.trim()
                        ? t.lang === "sr"
                          ? "Obavezno polje"
                          : t.lang === "en"
                            ? "Required field"
                            : "Obyazatelnoe pole"
                        : undefined
                    }
                  >
                    <LocationAutocomplete
                      value={location}
                      onChange={setLocation}
                      placeholder={pw.fields.location.ph}
                      labels={pw.locationSearch}
                      lang={t.lang as Lang}
                    />
                  </div>
                </div>
              </section>

              {selectedTaskConfigs.map((task) => {
                const mode = taskModes[task.task] ?? "rough";
                const details = taskDetails[task.task] ?? {};
                const isTaskOpen = openTaskAccordions[task.task] ?? true;
                return (
                  <section
                    key={task.task}
                    className={`card task-accordion${isTaskOpen ? " is-open" : ""}`}
                    style={{ padding: "12px 14px" }}
                  >
                    <button
                      type="button"
                      className="task-accordion__summary"
                      style={{ position: "relative", textAlign: "left", width: "100%" }}
                      aria-expanded={isTaskOpen}
                      onClick={() =>
                        setOpenTaskAccordions((prev) => ({
                          ...prev,
                          [task.task]: !(prev[task.task] ?? true),
                        }))
                      }
                    >
                      <div className="task-accordion__summary-text">
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                          {localized(task.title)}
                        </p>
                        <p style={{ fontSize: 12.5, color: "var(--ink3)" }}>{localized(task.summary)}</p>
                      </div>
                      <span
                        className="task-accordion__chevron"
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          width: 20,
                          height: 20,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--ink3)",
                          pointerEvents: "none",
                          transform: isTaskOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform .2s ease, color .2s ease",
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {isTaskOpen ? <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                      <div
                        className="estimate-mode-toggle"
                        role="radiogroup"
                        aria-label={t.lang === "sr" ? "Nivo preciznosti procene" : t.lang === "en" ? "Estimate precision mode" : "Rezhim tochnosti otsenki"}
                        style={{
                          position: "relative",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          alignItems: "center",
                          width: "min(100%, 320px)",
                          borderRadius: "var(--r)",
                          padding: 3,
                          background: "var(--acc)",
                          boxShadow: "0 2px 8px rgba(196,92,46,.28)",
                        }}
                      >
                        <span
                          className={`estimate-mode-toggle__thumb${mode === "rough" ? " is-rough" : ""}`}
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: 3,
                            top: 3,
                            bottom: 3,
                            width: "calc(50% - 3px)",
                            borderRadius: "var(--r)",
                            background: "var(--card)",
                            boxShadow: "0 6px 16px rgba(24,24,27,.12)",
                            transform: mode === "rough" ? "translateX(calc(100% - 3px))" : "translateX(0)",
                            transition: "transform .28s cubic-bezier(.22,1,.36,1),box-shadow .22s ease",
                            pointerEvents: "none",
                          }}
                        />
                        <button
                          type="button"
                          className={`estimate-mode-toggle__option${mode === "exact" ? " is-active" : ""}`}
                          aria-pressed={mode === "exact"}
                          style={{
                            position: "relative",
                            zIndex: 1,
                            border: "none",
                            background: "transparent",
                            color: mode === "exact" ? "var(--acc)" : "rgba(255,255,255,.88)",
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            padding: "9px 12px",
                            borderRadius: "var(--r)",
                            transition: "color .18s ease, transform .18s ease",
                          }}
                          onClick={() =>
                            setTaskModes((prev) => ({ ...prev, [task.task]: "exact" }))
                          }
                        >
                          {t.lang === "sr" ? "Znam tacne mere" : t.lang === "en" ? "I know exact values" : "Znayu tochnye znacheniya"}
                        </button>
                        <button
                          type="button"
                          className={`estimate-mode-toggle__option${mode === "rough" ? " is-active" : ""}`}
                          aria-pressed={mode === "rough"}
                          style={{
                            position: "relative",
                            zIndex: 1,
                            border: "none",
                            background: "transparent",
                            color: mode === "rough" ? "var(--acc)" : "rgba(255,255,255,.88)",
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            padding: "9px 12px",
                            borderRadius: "var(--r)",
                            transition: "color .18s ease, transform .18s ease",
                          }}
                          onClick={() =>
                            setTaskModes((prev) => ({ ...prev, [task.task]: "rough" }))
                          }
                        >
                          {t.lang === "sr" ? "Treba okvirna procena" : t.lang === "en" ? "Rough estimate is enough" : "Nuzhna orientirovochnaya otsenka"}
                        </button>
                      </div>
                      {task.task === "winreplace" ? (
                        <div
                          style={{ display: "grid", gap: 8 }}
                          title={
                            windowGroupsMissingExact
                              ? t.lang === "sr"
                                ? "Za tacnu procenu unesi dimenzije (sirinu i visinu) za svaki otvor."
                                : t.lang === "en"
                                  ? "For exact mode, enter width and height for each opening."
                                  : "Dlya tochnogo rezhima ukazhite shirinu i vysotu kazhdogo proema."
                              : undefined
                          }
                        >
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", margin: 0 }}>
                            {t.lang === "sr" ? "Otvori" : t.lang === "en" ? "Openings" : "Proemy"}
                          </p>
                          {openingGroups.map((group) => {
                            const presetHint =
                              t.lang === "sr"
                                ? `Predlog dimenzija za ovaj tip: ${OPENING_TYPE_PRESETS[group.type].widthCm} × ${OPENING_TYPE_PRESETS[group.type].heightCm} cm (koristi "Primeni predlog" ili promeni ručno).`
                                : t.lang === "en"
                                  ? `Suggested size for this type: ${OPENING_TYPE_PRESETS[group.type].widthCm} × ${OPENING_TYPE_PRESETS[group.type].heightCm} cm — use "Apply preset" or edit manually.`
                                  : `Predlozhenie: ${OPENING_TYPE_PRESETS[group.type].widthCm} × ${OPENING_TYPE_PRESETS[group.type].heightCm} sm`;
                            return (
                            <div
                              key={group.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr auto auto",
                                gap: 8,
                                alignItems: "end",
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    marginBottom: 6,
                                    minHeight: 0,
                                  }}
                                >
                                  <label className="flabel" style={{ marginBottom: 0 }}>
                                    {t.lang === "sr" ? "Tip otvora" : t.lang === "en" ? "Opening type" : "Tip proema"}
                                  </label>
                                  <span
                                    title={presetHint}
                                    aria-label={presetHint}
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      lineHeight: 1,
                                      color: "var(--ink4)",
                                      border: "1px solid var(--bdr2)",
                                      borderRadius: 999,
                                      width: 16,
                                      height: 16,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "help",
                                      flexShrink: 0,
                                    }}
                                  >
                                    i
                                  </span>
                                </div>
                                <select
                                  className="fselect"
                                  value={group.type}
                                  title={presetHint}
                                  onChange={(event) =>
                                    setWindowOpeningGroups((groups) =>
                                      groups.map((entry) =>
                                        entry.id === group.id
                                          ? (() => {
                                              const nextType = event.target.value as OpeningType;
                                              const preset = OPENING_TYPE_PRESETS[nextType];
                                              if (!entry.widthCm.trim() || !entry.heightCm.trim()) {
                                                return {
                                                  ...entry,
                                                  type: nextType,
                                                  widthCm: preset.widthCm,
                                                  heightCm: preset.heightCm,
                                                };
                                              }
                                              return { ...entry, type: nextType };
                                            })()
                                          : entry,
                                      ),
                                    )
                                  }
                                >
                                  <option value="single">{t.lang === "sr" ? "Jednokrilni" : t.lang === "en" ? "Single sash" : "Odnostvorchatyy"}</option>
                                  <option value="double">{t.lang === "sr" ? "Dvokrilni" : t.lang === "en" ? "Double sash" : "Dvustvorchatyy"}</option>
                                  <option value="triple">{t.lang === "sr" ? "Trokrilni" : t.lang === "en" ? "Triple sash" : "Trekhstvorchatyy"}</option>
                                  <option value="balconyDoor">{t.lang === "sr" ? "Balkonska vrata" : t.lang === "en" ? "Balcony door" : "Balkonnaya dver"}</option>
                                </select>
                              </div>
                              <div>
                                <label className="flabel">{t.lang === "sr" ? "Broj kom." : t.lang === "en" ? "Qty" : "Kol-vo"}</label>
                                <input
                                  className="finput"
                                  type="number"
                                  min={1}
                                  value={group.count}
                                  onChange={(event) =>
                                    setWindowOpeningGroups((groups) =>
                                      groups.map((entry) =>
                                        entry.id === group.id
                                          ? { ...entry, count: Math.max(1, Number(event.target.value || 1)) }
                                          : entry,
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="flabel">{t.lang === "sr" ? "Sirina (cm)" : t.lang === "en" ? "Width (cm)" : "Shirina (sm)"}</label>
                                <input
                                  className="finput"
                                  type="number"
                                  min={1}
                                  value={group.widthCm}
                                  onChange={(event) =>
                                    setWindowOpeningGroups((groups) =>
                                      groups.map((entry) =>
                                        entry.id === group.id
                                          ? { ...entry, widthCm: event.target.value }
                                          : entry,
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="flabel">{t.lang === "sr" ? "Visina (cm)" : t.lang === "en" ? "Height (cm)" : "Vysota (sm)"}</label>
                                <input
                                  className="finput"
                                  type="number"
                                  min={1}
                                  value={group.heightCm}
                                  onChange={(event) =>
                                    setWindowOpeningGroups((groups) =>
                                      groups.map((entry) =>
                                        entry.id === group.id
                                          ? { ...entry, heightCm: event.target.value }
                                          : entry,
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                className="btn-g"
                                style={{ padding: "8px 10px" }}
                                onClick={() =>
                                  setWindowOpeningGroups((groups) =>
                                    groups.map((entry) =>
                                      entry.id === group.id
                                        ? {
                                            ...entry,
                                            widthCm: OPENING_TYPE_PRESETS[entry.type].widthCm,
                                            heightCm: OPENING_TYPE_PRESETS[entry.type].heightCm,
                                          }
                                        : entry,
                                    ),
                                  )
                                }
                              >
                                {t.lang === "sr" ? "Primeni predlog" : t.lang === "en" ? "Apply preset" : "Primenit preset"}
                              </button>
                              <button
                                type="button"
                                className="btn-g"
                                style={{ padding: "8px 10px" }}
                                onClick={() =>
                                  setWindowOpeningGroups((groups) =>
                                    groups.length > 1 ? groups.filter((entry) => entry.id !== group.id) : groups,
                                  )
                                }
                                disabled={openingGroups.length <= 1}
                              >
                                {t.lang === "sr" ? "Ukloni" : t.lang === "en" ? "Remove" : "Udalit"}
                              </button>
                            </div>
                          );
                          })}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <button
                              type="button"
                              className="btn-g"
                              onClick={() =>
                                setWindowOpeningGroups((groups) => [...groups, createOpeningGroup()])
                              }
                            >
                              {t.lang === "sr" ? "+ Dodaj otvor" : t.lang === "en" ? "+ Add opening" : "+ Dobavit proem"}
                            </button>
                            <p style={{ margin: 0, fontSize: 12, color: "var(--ink3)" }}>
                              {t.lang === "sr"
                                ? `Ukupno komada: ${windowGroupOpenings}`
                                : t.lang === "en"
                                  ? `Total openings: ${windowGroupOpenings}`
                                  : `Vsego proemov: ${windowGroupOpenings}`}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {task.sections.map((section) => (
                        <div key={section.id}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", marginBottom: 8 }}>
                            {localized(section.title)}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="res-2col">
                            {section.fields.map((field) => {
                              if (
                                task.task === "winreplace" &&
                                (field.key === "openingsCount" || field.key === "openingDimensions")
                              ) {
                                return null;
                              }
                              const value = details[field.key];
                              const missing = isRequiredFieldMissing(field, value, mode);
                              const requiredMsg =
                                t.lang === "sr" ? "Obavezno polje" : t.lang === "en" ? "Required field" : "Obyazatelnoe pole";
                              const helpText = field.help ? localized(field.help) : undefined;
                              const controlTitle = missing ? requiredMsg : helpText;
                              return (
                                <div key={`${task.task}-${section.id}-${field.key}`}>
                                  <label className="flabel">
                                    {localized(field.label)}
                                    {field.importance === "required" ? " *" : ""}
                                  </label>
                                  {field.kind === "select" ? (
                                    <select
                                      className="fselect"
                                      value={String(value ?? "")}
                                      title={controlTitle}
                                      onChange={(event) =>
                                        setTaskFieldValue(task.task, field.key, event.target.value)
                                      }
                                    >
                                      <option value="">
                                        {t.lang === "sr" ? "Izaberi" : t.lang === "en" ? "Select" : "Vyberite"}
                                      </option>
                                      {(field.options ?? []).map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {localized(option.label)}
                                        </option>
                                      ))}
                                    </select>
                                  ) : field.kind === "toggle" ? (
                                    <label
                                      title={controlTitle}
                                      style={{
                                        display: "inline-flex",
                                        gap: 8,
                                        alignItems: "center",
                                        fontSize: 12.5,
                                        color: "var(--ink2)",
                                        borderRadius: 6,
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={Boolean(value)}
                                        onChange={(event) =>
                                          setTaskFieldValue(task.task, field.key, event.target.checked)
                                        }
                                      />
                                      <span>{localized(field.label)}</span>
                                    </label>
                                  ) : field.kind === "chips" ? (
                                    <input
                                      className="finput"
                                      value={Array.isArray(value) ? value.join(", ") : ""}
                                      placeholder={field.placeholder ? localized(field.placeholder) : ""}
                                      title={controlTitle}
                                      onChange={(event) =>
                                        setTaskFieldValue(
                                          task.task,
                                          field.key,
                                          event.target.value
                                            .split(",")
                                            .map((entry) => entry.trim())
                                            .filter(Boolean),
                                        )
                                      }
                                    />
                                  ) : (
                                    <input
                                      className="finput"
                                      type={field.kind === "number" ? "number" : "text"}
                                      value={String(value ?? "")}
                                      placeholder={field.placeholder ? localized(field.placeholder) : ""}
                                      title={controlTitle}
                                      onChange={(event) =>
                                        setTaskFieldValue(task.task, field.key, event.target.value)
                                      }
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {task.task === "winreplace" && windowEstimatePreview ? (
                        <div
                          style={{
                            border: "1px dashed var(--acc)",
                            borderRadius: 12,
                            padding: "10px 12px",
                            background: "var(--accbg)",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--ink2)" }}>
                            {t.lang === "sr"
                              ? "Informativna procena PVC/ALU stolarije"
                              : t.lang === "en"
                                ? "Informative PVC/ALU estimate"
                                : "Informativnaya otsenka PVC/ALU"}
                          </p>
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink3)" }}>
                            {t.lang === "sr"
                              ? `${windowEstimatePreview.openings} otvora • ${windowEstimatePreview.areaM2} m2`
                              : t.lang === "en"
                                ? `${windowEstimatePreview.openings} openings • ${windowEstimatePreview.areaM2} m2`
                                : `${windowEstimatePreview.openings} proemov • ${windowEstimatePreview.areaM2} m2`}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: "var(--acc)" }}>
                            {windowEstimatePreview.lo.toLocaleString()} - {windowEstimatePreview.hi.toLocaleString()} EUR
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "var(--ink4)" }}>
                            {t.lang === "sr"
                              ? "Procena je informativna i koristi se za planiranje budzeta."
                              : t.lang === "en"
                                ? "This range is indicative and used for planning."
                                : "Diapazon informativnyy i ispolzuetsya dlya planirovaniya byudzheta."}
                          </p>
                        </div>
                      ) : null}
                    </div> : null}
                  </section>
                );
              })}

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="res-2col">
                <div>
                  <label className="flabel">{pw.fields.stage.label}</label>
                  <select
                    className="fselect"
                    value={stage}
                    onChange={(e) => setStage(Number(e.target.value))}
                  >
                    {stageOptions.map((o, i) => (
                      <option key={i} value={i}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {stageHelper ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ink3)",
                        lineHeight: 1.55,
                        fontFamily: "var(--sans)",
                        marginTop: 8,
                      }}
                    >
                      {stageHelper}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="flabel">{pw.fields.userType.label}</label>
                  <select className="fselect" value={userType} onChange={e=>setUserType(Number(e.target.value))}>
                    {pw.fields.userType.opts.map((o,i)=><option key={i} value={i}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <>
              {conditionalDetailCommonFields.length > 0 ? (
                <section className="card" style={{ padding: "12px 14px", marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", marginBottom: 10 }}>
                    {t.planner.conditionalDetailsSectionTitle}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="res-2col">
                    {conditionalDetailCommonFields.map((field) => {
                      const value = conditionalDetails[field.id];
                      const missing = isConditionalDetailMissing(field, value);
                      const requiredMsg =
                        t.lang === "sr"
                          ? "Obavezno polje"
                          : t.lang === "en"
                            ? "Required field"
                            : "Obyazatelnoe pole";
                      return (
                        <div key={field.id}>
                          <label className="flabel">
                            {localized(field.label)}
                            {field.importance === "required" ? " *" : ""}
                            {isIntakeSuggested(field.id) ? (
                              <span className="intake-field-tag">
                                {t.lang === "sr" ? " predloženo" : t.lang === "en" ? " suggested" : " предложено"}
                              </span>
                            ) : null}
                          </label>
                          {field.kind === "select" ? (
                            <select
                              className={`fselect${isIntakeSuggested(field.id) ? " intake-suggested" : ""}${isIntakeMissing(field.id) ? " intake-missing" : ""}`}
                              value={String(value ?? "")}
                              title={missing ? requiredMsg : undefined}
                              onChange={(event) =>
                                setConditionalDetails((prev) => ({
                                  ...prev,
                                  [field.id]: event.target.value,
                                }))
                              }
                            >
                              <option value="">
                                {t.lang === "sr" ? "Izaberi" : t.lang === "en" ? "Select" : "Vyberite"}
                              </option>
                              {(field.options ?? []).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {localized(option.label)}
                                </option>
                              ))}
                            </select>
                          ) : field.kind === "toggle" ? (
                            <label
                              title={missing ? requiredMsg : undefined}
                              style={{
                                display: "inline-flex",
                                gap: 8,
                                alignItems: "center",
                                fontSize: 12.5,
                                color: "var(--ink2)",
                                borderRadius: 6,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(event) =>
                                  setConditionalDetails((prev) => ({
                                    ...prev,
                                    [field.id]: event.target.checked,
                                  }))
                                }
                              />
                              <span>{localized(field.label)}</span>
                            </label>
                          ) : (
                            <input
                              className={`finput${isIntakeSuggested(field.id) ? " intake-suggested" : ""}${isIntakeMissing(field.id) ? " intake-missing" : ""}`}
                              type={field.kind === "number" ? "number" : "text"}
                              value={String(value ?? "")}
                              title={missing ? requiredMsg : undefined}
                              onChange={(event) =>
                                setConditionalDetails((prev) => ({
                                  ...prev,
                                  [field.id]: event.target.value,
                                }))
                              }
                            />
                          )}
                          {field.helper ? (
                            <p style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink4)" }}>
                              {localized(field.helper)}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
              <div style={{marginBottom:16}}>
                <label className="flabel">{pw.fields.location.label}</label>
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder={pw.fields.location.ph}
                  labels={pw.locationSearch}
                  lang={t.lang as Lang}
                />
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {pw.locChips.map(lc=>(
                    <button key={lc} className={`lchip${location===lc?" act":""}`} onClick={()=>setLocation(lc)}>{lc}</button>
                  ))}
                </div>
              </div>
              {detailsFieldLayout.taskOrder.some(
                (taskId) => (detailsFieldLayout.taskSpecificByTask[taskId] ?? []).length > 0,
              ) ? (
                <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                  {detailsFieldLayout.taskOrder.map((taskId) => {
                    const taskFields = detailsFieldLayout.taskSpecificByTask[taskId] ?? [];
                    if (taskFields.length === 0) return null;
                    const taskLabel = plannerTaskDefinitions[taskId]?.label;
                    return (
                      <section key={taskId} className="card" style={{ padding: "10px 12px" }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink2)", marginBottom: 8 }}>
                          {taskLabel ? localized(taskLabel) : taskId}
                        </p>
                        <p style={{ fontSize: 11.5, color: "var(--ink4)", marginBottom: 10 }}>
                          {t.lang === "sr"
                            ? "Polja su prikazana samo za izabrani zadatak."
                            : t.lang === "en"
                              ? "Fields are shown only for the selected task."
                              : "Polya pokazany tolko dlya vybrannoy zadachi."}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="res-2col">
                          {taskFields.map((field) => {
                            const value = conditionalDetails[field.id];
                            const missing = isConditionalDetailMissing(field, value);
                            const requiredMsg =
                              t.lang === "sr"
                                ? "Obavezno polje"
                                : t.lang === "en"
                                  ? "Required field"
                                  : "Obyazatelnoe pole";
                            return (
                              <div key={field.id}>
                                <label className="flabel">
                                  {localized(field.label)}
                                  {field.importance === "required" ? " *" : ""}
                                  {isIntakeSuggested(field.id) ? (
                                    <span className="intake-field-tag">
                                      {t.lang === "sr" ? " predloženo" : t.lang === "en" ? " suggested" : " предложено"}
                                    </span>
                                  ) : null}
                                </label>
                                {field.kind === "select" ? (
                                  <select
                                    className={`fselect${isIntakeSuggested(field.id) ? " intake-suggested" : ""}${isIntakeMissing(field.id) ? " intake-missing" : ""}`}
                                    value={String(value ?? "")}
                                    title={missing ? requiredMsg : undefined}
                                    onChange={(event) =>
                                      setConditionalDetails((prev) => ({
                                        ...prev,
                                        [field.id]: event.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">
                                      {t.lang === "sr" ? "Izaberi" : t.lang === "en" ? "Select" : "Vyberite"}
                                    </option>
                                    {(field.options ?? []).map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {localized(option.label)}
                                      </option>
                                    ))}
                                  </select>
                                ) : field.kind === "toggle" ? (
                                  <label
                                    title={missing ? requiredMsg : undefined}
                                    style={{
                                      display: "inline-flex",
                                      gap: 8,
                                      alignItems: "center",
                                      fontSize: 12.5,
                                      color: "var(--ink2)",
                                      borderRadius: 6,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(value)}
                                      onChange={(event) =>
                                        setConditionalDetails((prev) => ({
                                          ...prev,
                                          [field.id]: event.target.checked,
                                        }))
                                      }
                                    />
                                    <span>{localized(field.label)}</span>
                                  </label>
                                ) : (
                                  <input
                                    className={`finput${isIntakeSuggested(field.id) ? " intake-suggested" : ""}${isIntakeMissing(field.id) ? " intake-missing" : ""}`}
                                    type={field.kind === "number" ? "number" : "text"}
                                    value={String(value ?? "")}
                                    title={missing ? requiredMsg : undefined}
                                    onChange={(event) =>
                                      setConditionalDetails((prev) => ({
                                        ...prev,
                                        [field.id]: event.target.value,
                                      }))
                                    }
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : null}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="res-2col">
                <div>
                  <label className="flabel">{pw.fields.stage.label}</label>
                  <select
                    className="fselect"
                    value={stage}
                    onChange={(e) => setStage(Number(e.target.value))}
                  >
                    {stageOptions.map((o, i) => (
                      <option key={i} value={i}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {stageHelper ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--ink3)",
                        lineHeight: 1.55,
                        fontFamily: "var(--sans)",
                        marginTop: 8,
                      }}
                    >
                      {stageHelper}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="flabel">{pw.fields.userType.label}</label>
                  <select className="fselect" value={userType} onChange={e=>setUserType(Number(e.target.value))}>
                    {pw.fields.userType.opts.map((o,i)=><option key={i} value={i}>{o}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
          <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
            <button className="btn-g" onClick={()=>setStep(1)}>{pw.back}</button>
            <button className="btn-p" onClick={()=>setStep(3)} disabled={!canNext2} style={{fontSize:14}}>{pw.next}</button>
          </div>
        </div>
      )}

      {/* STEP 3: Infrastructure */}
      {step===3&&S(
        <div>
          <h3 style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:8,marginTop:0,lineHeight:1.3}}>
            {pw.fields.infra.label}
          </h3>
          <p style={{fontSize:13.5,color:"var(--ink3)",marginBottom:22,fontFamily:"var(--sans)"}}>
            {t.lang==="sr"?"Ovo pomaže alatu da predloži prava rešenja za vašu situaciju.":t.lang==="en"?"This helps the tool suggest the right solutions for your situation.":"Это помогает инструменту предложить правильные решения для вашей ситуации."}
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {pw.fields.infra.opts.map((opt,i)=>(
              <div key={i} onClick={()=>setInfra(i)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",border:`2px solid ${infra===i?"var(--acc)":"var(--bdr)"}`,borderRadius:"var(--r)",background:infra===i?"var(--accbg)":"var(--bg)",cursor:"pointer",transition:"all .15s"}}>
                <span style={{fontSize:18}}>{i===0?"🏙️":i===1?"⚡":"🏡"}</span>
                <span style={{fontSize:13.5,fontWeight:500,color:infra===i?"var(--acc)":"var(--ink)",fontFamily:"var(--sans)"}}>{opt}</span>
                <div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",border:`2px solid ${infra===i?"var(--acc)":"var(--bdr2)"}`,background:infra===i?"var(--acc)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {infra===i&&<span style={{fontSize:9,color:"#fff"}}>●</span>}
                </div>
              </div>
            ))}
          </div>

          {infra===2&&(
            <div className="inf-warn" style={{marginTop:16}}>
              <span style={{fontSize:16,flexShrink:0}}>🏡</span>
              <p style={{fontSize:12.5,color:"var(--amb)",lineHeight:1.65,fontFamily:"var(--sans)"}}>{t.infra.none}</p>
            </div>
          )}

          <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
            <button className="btn-g" onClick={()=>setStep(2)}>{pw.back}</button>
            <button className="btn-p" onClick={doSubmit} disabled={submitting || !canSubmitInfra} style={{fontSize:14,padding:"12px 28px"}}>
              {submitting?(<span style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.35)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>
                {pw.submitting}
              </span>):pw.submit}
            </button>
          </div>
          {projectState.artifacts.length > 0 ? (
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--ink3)" }}>
                {t.results.agentArtifactsTitle}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--ink4)", lineHeight: 1.5 }}>
                {t.results.agentArtifactsSub}
              </p>
              {projectState.artifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  style={{ border: "1px solid var(--bdr)", borderRadius: 10, padding: "10px 12px", background: "var(--bgw)" }}
                >
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--ink2)" }}>{artifact.title}</p>
                  <ArtifactContentRich content={artifact.content} lang={t.lang as Lang} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
