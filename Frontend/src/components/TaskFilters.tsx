// Search box and status and priority menus above the board.
import type { TaskPriority, TaskStatus } from "../types";
import { TASK_PRIORITIES } from "../utils/taskFilters";

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done", "Hold"];

export default function TaskFilters({
  query,
  status,
  priority,
  shown,
  total,
  onQuery,
  onStatus,
  onPriority,
  onClear,
}: {
  query: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  shown: number;
  total: number;
  onQuery: (value: string) => void;
  onStatus: (value: TaskStatus | "all") => void;
  onPriority: (value: TaskPriority | "all") => void;
  onClear: () => void;
}) {
  const active = query.trim().length > 0 || status !== "all" || priority !== "all";

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="text-sm text-stone-600 dark:text-stone-300">Search tasks</span>
          <input
            className="field"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Title or description"
            type="search"
          />
        </label>
        <label className="block sm:w-40">
          <span className="text-sm text-stone-600 dark:text-stone-300">Status</span>
          <select className="field" value={status} onChange={(event) => onStatus(event.target.value as TaskStatus | "all")}>
            <option value="all">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:w-40">
          <span className="text-sm text-stone-600 dark:text-stone-300">Priority</span>
          <select className="field" value={priority} onChange={(event) => onPriority(event.target.value as TaskPriority | "all")}>
            <option value="all">All priorities</option>
            {TASK_PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        {active && (
          <button type="button" className="rounded border border-stone-300 px-3 py-2 text-sm dark:border-stone-600" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {active && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Showing {shown} of {total} {total === 1 ? "task" : "tasks"}.
        </p>
      )}
    </div>
  );
}
