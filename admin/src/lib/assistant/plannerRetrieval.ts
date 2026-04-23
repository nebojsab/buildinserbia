import { getPlannerKB } from "./knowledge";
import type { PlannerAssistantContext, PlannerKnowledgeEntry } from "./types";

function normalize(input: string): string {
  return input.toLowerCase().trim();
}

function scoreMessage(entry: PlannerKnowledgeEntry, message: string): number {
  const query = normalize(message);
  const text = `${entry.title} ${entry.content} ${entry.tags.join(" ")}`.toLowerCase();
  if (text.includes(query)) return 4;
  return query
    .split(/\s+/)
    .filter(Boolean)
    .reduce((score, token) => (text.includes(token) ? score + 1 : score), 0);
}

export function retrievePlannerContext(
  context: PlannerAssistantContext,
  message: string,
): PlannerKnowledgeEntry[] {
  const entries = getPlannerKB(context.locale);
  const scoped = entries
    .map((entry) => {
      let score = scoreMessage(entry, message);
      if (entry.stepKey && context.currentStep && entry.stepKey === context.currentStep) score += 2;
      if (
        entry.taskKey &&
        context.selectedTasks?.some((task) => task.toLowerCase() === entry.taskKey?.toLowerCase())
      ) {
        score += 2;
      }
      return { entry, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((row) => row.entry);

  return scoped;
}
