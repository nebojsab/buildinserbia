import type {
  AppLocale,
  PlannerIntakeInput,
  ProjectArtifact,
  ProjectState,
} from "../../types/agentic";
import type { ProjectType } from "../../types/plan";
import {
  formatTasksForUser,
  humanizeIntentForUser,
} from "../artifactUserText";
import {
  runCostEstimationTool,
  runNextStepsTool,
  runProductRecommendationTool,
  runResourceLookupTool,
} from "./tools";

export type OrchestratorResult = {
  assistantMessage: string;
  state: ProjectState;
  artifactsDelta: ProjectArtifact[];
};

function inferIntent(projectType: ProjectType | null, tasks: string[], goal: string): string {
  if (projectType === "newbuild") return "new_house_planning";
  if (projectType === "reno" && tasks.includes("winreplace")) return "reno_with_windows";
  if (projectType === "reno") return "renovation_planning";
  if (projectType === "extension") return "extension_planning";
  if (projectType === "interior") return "interior_project";
  if (projectType === "yard") return "yard_project";
  if (goal.toLowerCase().includes("kuca")) return "new_house_planning";
  return "general_planning";
}

function toBudgetBand(budget: number): ProjectState["constraints"]["budgetBand"] {
  if (budget <= 1) return "low";
  if (budget >= 3) return "high";
  return "mid";
}

const ARTIFACT_TITLE: Record<
  AppLocale,
  Record<ProjectArtifact["type"], string>
> = {
  sr: {
    project_summary: "Rezime projekta",
    rough_budget: "Okvirna procena budžeta",
    scope_of_work: "Obim radova (prvi pass)",
    next_steps: "Sledeći koraci i resursi",
  },
  en: {
    project_summary: "Project summary",
    rough_budget: "Rough budget estimate",
    scope_of_work: "Scope of work (initial pass)",
    next_steps: "Next steps and resources",
  },
  ru: {
    project_summary: "Сводка проекта",
    rough_budget: "Ориентировочный бюджет",
    scope_of_work: "Объём работ (первично)",
    next_steps: "Следующие шаги и ссылки",
  },
};

const COPY = (locale: AppLocale) => {
  const t = {
    sr: {
      notEntered: "Nije uneto",
      goal: "Cilj",
      loc: "Lokacija",
      summaryFocus: "Fokus projekta (prema unosu)",
      tasks: "Izabrani zadaci",
      noTasks: "nema izbora",
      products: "Preporučeni proizvodi / materijali",
    },
    en: {
      notEntered: "Not provided",
      goal: "Goal",
      loc: "Location",
      summaryFocus: "Project focus (from your input)",
      tasks: "Selected tasks",
      noTasks: "none selected",
      products: "Suggested products / materials",
    },
    ru: {
      notEntered: "Нет данных",
      goal: "Цель",
      loc: "Адрес",
      summaryFocus: "Фокус проекта (по вводу)",
      tasks: "Выбранные работы",
      noTasks: "не выбрано",
      products: "Предлагаемые материалы",
    },
  };
  return t[locale];
};

const ASSUMPTION_INTAKE: Record<AppLocale, string> = {
  sr: "Rezime je generisan iz unosa u planeru.",
  en: "Summary is generated from planner intake answers.",
  ru: "Сводка сформирована из ответов планировщика.",
};

const ASSISTANT_MSG: Record<AppLocale, string> = {
  sr: "Unos je strukturisan. Generisane su kratke pripremne kartice: rezime, budžet, obim i sledeći koraci (uključujući i linkove gde je moguće).",
  en: "Your answers are structured. We generated short prep cards: summary, budget, scope, and next steps (including links where applicable).",
  ru: "Ответы структурированы. Сформированы краткие карточки: сводка, бюджет, объём и следующие шаги (со ссылками по возможности).",
};

const OPEN_Q_LOCATION: Record<AppLocale, string> = {
  sr: "Unesite lokaciju (idealno sa nazivom opštine) za preciznije lokalne preporuke.",
  en: "Add a project location (ideally with municipality) for more precise local suggestions.",
  ru: "Укажите адрес (желательно с општиной) для более точных рекомендаций.",
};

function createArtifact(
  type: ProjectArtifact["type"],
  title: string,
  content: string,
  assumptions: string[],
): ProjectArtifact {
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    title,
    status: "draft",
    content,
    assumptions,
    updatedAt: new Date().toISOString(),
  };
}

export function createInitialProjectState(sessionId: string): ProjectState {
  return {
    sessionId,
    goal: "",
    projectType: null,
    intent: null,
    location: null,
    constraints: {
      budgetBand: "unknown",
      timeline: null,
    },
    knownFacts: {},
    openQuestions: [],
    selectedTasks: [],
    artifacts: [],
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function orchestratePlannerIntake(
  prevState: ProjectState,
  input: PlannerIntakeInput,
): OrchestratorResult {
  const locale = input.locale;
  const c = COPY(locale);
  const titles = ARTIFACT_TITLE[locale];

  const estimate = runCostEstimationTool(input);
  const resources = runResourceLookupTool(input);
  const products = runProductRecommendationTool(input);
  const next = runNextStepsTool(input);

  const intent = inferIntent(input.projectType, input.tasks, input.goal);

  const projectSummaryContent = [
    `${c.goal}: ${input.goal || c.notEntered}`,
    `${c.loc}: ${input.location || c.notEntered}`,
    `${c.summaryFocus}: ${humanizeIntentForUser(input.locale, intent)}`,
  ].join("\n");

  const taskLine =
    input.tasks.length > 0
      ? formatTasksForUser(input.locale, input.projectType, input.tasks)
      : c.noTasks;
  const scopeContent = [
    `${c.tasks}: ${taskLine}`,
    `${c.products}: ${products.output.recommendations.join("; ")}`,
  ].join("\n");

  const budgetLine = `${estimate.output.low.toLocaleString(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "sr-RS")} – ${estimate.output.high.toLocaleString(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "sr-RS")} ${estimate.output.currency}`;

  const nextContent = [
    ...next.output.steps,
    ...resources.output.links.map((link) => `${link.label}: ${link.href}`),
  ].join("\n");

  const artifactsDelta: ProjectArtifact[] = [
    createArtifact("project_summary", titles.project_summary, projectSummaryContent, [ASSUMPTION_INTAKE[locale]]),
    createArtifact("rough_budget", titles.rough_budget, budgetLine, estimate.assumptions),
    createArtifact("scope_of_work", titles.scope_of_work, scopeContent, products.assumptions),
    createArtifact("next_steps", titles.next_steps, nextContent, [...next.assumptions, ...resources.assumptions]),
  ];

  const knownFacts: ProjectState["knownFacts"] = {
    ...prevState.knownFacts,
    stage: { value: input.stage, confidence: "high" },
    selectedTaskCount: { value: input.tasks.length, confidence: "high" },
  };

  if (resources.output.municipalityHint) {
    knownFacts.municipalityHint = { value: resources.output.municipalityHint, confidence: "medium" };
  }

  const openQuestions: string[] = [];
  if (input.location.trim().length === 0) {
    openQuestions.push(OPEN_Q_LOCATION[locale]);
  }

  const nextState: ProjectState = {
    ...prevState,
    goal: input.goal,
    projectType: input.projectType,
    intent,
    location: input.location || null,
    constraints: {
      ...prevState.constraints,
      budgetBand: toBudgetBand(input.budget),
    },
    selectedTasks: input.tasks,
    knownFacts,
    openQuestions,
    artifacts: artifactsDelta,
    lastUpdatedAt: new Date().toISOString(),
  };

  return {
    assistantMessage: ASSISTANT_MSG[locale],
    state: nextState,
    artifactsDelta,
  };
}
