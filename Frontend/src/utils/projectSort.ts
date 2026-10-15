// Orders the project list and formats the date a project was created.
import type { Project } from "../types";

export type ProjectSort = "newest" | "oldest" | "name" | "name-desc";

export function formatCreatedDate(value?: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createdTime(project: Project) {
  const time = new Date(project.createdAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function compareProjects(sort: ProjectSort) {
  return (a: Project, b: Project) => {
    if (sort === "name" || sort === "name-desc") {
      const byName = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      if (byName !== 0) {
        return sort === "name" ? byName : -byName;
      }
    }
    const byDate = createdTime(a) - createdTime(b);
    return sort === "oldest" ? byDate : -byDate;
  };
}
