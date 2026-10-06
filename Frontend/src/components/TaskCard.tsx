import type { TaskCardProps } from "../types";

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <article className="rounded border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="font-medium">{task.title}</h3>
      <p className="mt-1 text-sm text-stone-600">{task.description}</p>
      <div className="mt-3 flex gap-3">
        <button type="button" className="text-sm text-teal-800" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="text-sm text-red-700" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}
