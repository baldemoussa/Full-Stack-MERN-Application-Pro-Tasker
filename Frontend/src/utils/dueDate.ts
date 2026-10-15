// Formats a due date and decides when an open task is overdue.
import type { Task } from "../types";

export function localTodayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatDueDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(task: Pick<Task, "dueDate" | "status">) {
  const key = task.dueDate?.slice(0, 10);
  if (!key || task.status === "Done") {
    return false;
  }
  return key < localTodayKey();
}
