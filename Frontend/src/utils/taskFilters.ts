import type { Task, TaskPriority, TaskStatus } from "../types";

export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"];

export function taskPriority(task: Task): TaskPriority {
  return task.priority ?? "Medium";
}

export function matchesTask(
  task: Task,
  query: string,
  status: TaskStatus | "all",
  priority: TaskPriority | "all",
) {
  const needle = query.trim().toLowerCase();
  const text = `${task.title} ${task.description}`.toLowerCase();
  const queryMatches = needle.length === 0 || text.includes(needle);
  const statusMatches = status === "all" || task.status === status;
  const priorityMatches = priority === "all" || taskPriority(task) === priority;
  return queryMatches && statusMatches && priorityMatches;
}
