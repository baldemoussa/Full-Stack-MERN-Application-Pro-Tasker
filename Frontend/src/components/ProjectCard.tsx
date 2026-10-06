import type { ProjectCardProps } from "../types";

export default function ProjectCard({ project, selected, onSelect }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(project._id)}
      className={`w-full rounded px-3 py-2 text-left ${
        selected ? "bg-teal-800 text-white" : "hover:bg-stone-100"
      }`}
    >
      <span className="block font-medium">{project.name}</span>
      <span className={`mt-1 block text-sm ${selected ? "text-teal-100" : "text-stone-500"}`}>
        {project.description}
      </span>
    </button>
  );
}
