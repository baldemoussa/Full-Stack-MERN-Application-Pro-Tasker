import type { ProjectCardProps } from "../types";

export default function ProjectCard({ project, selected, onSelect }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(project._id)}
      className={`w-full rounded px-3 py-2 text-left ${
        selected ? "bg-teal-800 text-white" : "hover:bg-white dark:hover:bg-stone-800"
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
    </button>
  );
}
