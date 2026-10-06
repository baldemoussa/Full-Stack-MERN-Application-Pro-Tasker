import type { TaskCardProps } from "../types";

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <article className="rounded border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-800">
      <h3 className="font-medium">{task.title}</h3>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{task.description}</p>
      <div className="mt-3 flex gap-3">
        <button type="button" className="text-sm text-teal-800 dark:text-teal-300" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="text-sm text-red-700 dark:text-red-300" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}
