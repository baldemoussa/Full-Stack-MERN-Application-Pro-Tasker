import type { TaskColumnProps, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

const columnTone: Record<TaskStatus, string> = {
  "To Do": "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900",
  "In Progress": "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
  Done: "border-emerald-100 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950",
};

export default function TaskColumn({ status, tasks, onEdit, onDelete }: TaskColumnProps) {
  return (
    <section className={`flex h-full min-h-48 flex-col rounded border p-3 ${columnTone[status]}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700 dark:text-stone-200">{status}</h2>
      <div className="mt-3 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </section>
  );
}
