import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskCardProps, TaskPriority } from "../types";
import { CommentIcon, PencilIcon, TrashIcon } from "./Icons";
import { taskPriority } from "../utils/taskFilters";

const priorityTone: Record<TaskPriority, string> = {
  Low: "bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
  Medium: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  High: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
};

export function TaskCardFace({ task }: { task: Task }) {
  const priority = taskPriority(task);
  return (
    <>
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${priorityTone[priority]}`}>{priority}</span>
      <h3 className="mt-2 break-words text-lg font-bold leading-tight">{task.title}</h3>
      <p className="mt-1 line-clamp-3 break-words text-sm text-stone-500 dark:text-stone-400">{task.description}</p>
    </>
  );
}

export default function TaskCard({ task, canEdit, onEdit, onDelete, onComment }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    disabled: !canEdit,
    data: { type: "Task", task },
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800 ${
        canEdit ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      {...(canEdit ? attributes : {})}
      {...(canEdit ? listeners : {})}
    >
      <TaskCardFace task={task} />
      <div
        className="mt-3 flex gap-2 border-t border-stone-100 pt-3 dark:border-stone-700"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="rounded p-1 text-teal-800 dark:text-teal-300" aria-label={`Comments on ${task.title}`} title="Comments" onClick={() => onComment(task)}>
          <CommentIcon />
        </button>
        {canEdit && (
          <>
            <button type="button" className="rounded p-1 text-teal-800 dark:text-teal-300" aria-label={`Edit ${task.title}`} title="Edit" onClick={() => onEdit(task)}>
              <PencilIcon />
            </button>
            <button type="button" className="rounded p-1 text-red-700 dark:text-red-300" aria-label={`Delete ${task.title}`} title="Delete" onClick={() => onDelete(task)}>
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
