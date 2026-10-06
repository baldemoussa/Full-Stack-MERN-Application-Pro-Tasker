import type { TaskCardProps } from "../types";

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="font-medium">{task.title}</h3>
      <p className="mt-1 text-sm text-stone-600">{task.description}</p>
    </article>
  );
}
