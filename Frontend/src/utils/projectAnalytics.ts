import type { CollaboratorUser, Task, TaskPriority, TaskStatus } from "../types";
import { isOverdue } from "./dueDate";
import { TASK_PRIORITIES, taskPriority } from "./taskFilters";

export const ANALYTICS_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done", "Hold"];

export interface StatusSlice {
  status: TaskStatus;
  count: number;
}

export interface PrioritySlice {
  priority: TaskPriority;
  count: number;
}

export interface WorkloadRow {
  id: string;
  name: string;
  photo?: string;
  total: number;
  done: number;
}

export interface TrendPoint {
  date: string;
  label: string;
  total: number;
}

export interface ProjectAnalytics {
  total: number;
  done: number;
  completion: number;
  assigned: number;
  unassigned: number;
  highOpen: number;
  overdue: number;
  byStatus: StatusSlice[];
  byPriority: PrioritySlice[];
  workload: WorkloadRow[];
  trend: TrendPoint[];
}

function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function createdKey(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dayKey(date);
}

function dayLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function creationTrend(tasks: Task[], days = 14): TrendPoint[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const points: TrendPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const date = dayKey(day);
    points.push({ date, label: dayLabel(date), total: 0 });
  }

  const start = points[0].date;
  const end = points[points.length - 1].date;
  let running = tasks.filter((task) => {
    const key = createdKey(task.createdAt);
    return key !== "" && key < start;
  }).length;
  const added = new Map<string, number>();
  for (const task of tasks) {
    const key = createdKey(task.createdAt);
    if (key >= start && key <= end) {
      added.set(key, (added.get(key) ?? 0) + 1);
    }
  }

  return points.map((point) => {
    running += added.get(point.date) ?? 0;
    return { ...point, total: running };
  });
}

function personName(person: CollaboratorUser) {
  return person.fullName || person.username;
}

export function analyzeProject(tasks: Task[]): ProjectAnalytics {
  const byStatus = ANALYTICS_STATUSES.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length,
  }));
  const byPriority = TASK_PRIORITIES.map((priority) => ({
    priority,
    count: tasks.filter((task) => taskPriority(task) === priority).length,
  }));
  const done = byStatus.find((slice) => slice.status === "Done")?.count ?? 0;
  const unassigned = tasks.filter((task) => (task.assignees ?? []).length === 0).length;
  const people = new Map<string, WorkloadRow>();

  for (const task of tasks) {
    for (const person of task.assignees ?? []) {
      const current = people.get(person._id) ?? {
        id: person._id,
        name: personName(person),
        photo: person.profilePhoto,
        total: 0,
        done: 0,
      };
      current.total += 1;
      if (task.status === "Done") {
        current.done += 1;
      }
      people.set(person._id, current);
    }
  }

  return {
    total: tasks.length,
    done,
    completion: tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100),
    assigned: tasks.length - unassigned,
    unassigned,
    highOpen: tasks.filter((task) => taskPriority(task) === "High" && task.status !== "Done").length,
    overdue: tasks.filter((task) => isOverdue(task)).length,
    byStatus,
    byPriority,
    workload: [...people.values()].sort((left, right) => right.total - left.total || left.name.localeCompare(right.name)),
    trend: creationTrend(tasks),
  };
}
