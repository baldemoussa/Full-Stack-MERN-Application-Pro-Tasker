import type { TaskColumnProps, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

const columnTone: Record<TaskStatus, string> = {
  "To Do": "bg-stone-100",
  "In Progress": "bg-amber-50",
  Done: "bg-emerald-50",
};

export default function TaskColumn({ status, tasks }: TaskColumnProps) {
  return (
    <section className={`rounded p-3 ${columnTone[status]}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">{status}</h2>
      <div className="mt-3 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-stone-500">No tasks</p>
        ) : (
          tasks.map((task) => <TaskCard key={task._id} task={task} />)
        )}
      </div>
    </section>
  );
}
