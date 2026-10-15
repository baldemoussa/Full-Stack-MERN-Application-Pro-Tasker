// One project in the sidebar. The selected card is teal. Badges show access and closed or archived.
import type { ProjectCardProps } from "../types";

export default function ProjectCard({ project, selected, onSelect }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(project._id)}
      className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${
        selected
          ? "bg-teal-800 text-white shadow-sm"
          : "border border-transparent hover:border-stone-200 hover:bg-white dark:hover:border-stone-700 dark:hover:bg-stone-800"
      }`}
    >
      <span className="block break-words font-medium">{project.name}</span>
      <span className={`mt-1 line-clamp-2 break-words text-sm ${selected ? "text-teal-100" : "text-stone-500 dark:text-stone-400"}`}>
        {project.description}
      </span>
      {project.access !== "owner" && (
        <span className={`mt-1 block text-xs ${selected ? "text-teal-100" : "text-stone-500 dark:text-stone-400"}`}>
          {project.access === "edit" ? "Can edit" : "View only"}
        </span>
      )}
      {project.access === "owner" && project.collaborators?.length > 0 && (
        <span className={`mt-1 block text-xs ${selected ? "text-teal-100" : "text-stone-500 dark:text-stone-400"}`}>
          Shared
        </span>
      )}
      {project.status === "closed" && (
        <span className={`mt-1 block text-xs ${selected ? "text-teal-100" : "text-amber-700 dark:text-amber-300"}`}>
          Closed
        </span>
      )}
      {project.status === "archived" && (
        <span className={`mt-1 block text-xs ${selected ? "text-teal-100" : "text-stone-500 dark:text-stone-400"}`}>
          Archived
        </span>
      )}
    </button>
  );
}
