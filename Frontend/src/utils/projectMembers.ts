// The people who can be assigned to a task: the owner plus every collaborator, without duplicates.
import type { CollaboratorUser, Project } from "../types";

export function projectMembers(project: Project): CollaboratorUser[] {
  const people = [project.user, ...(project.collaborators ?? []).map((entry) => entry.user)];
  const seen = new Set<string>();
  return people.filter((person) => {
    if (!person?._id || seen.has(person._id)) {
      return false;
    }
    seen.add(person._id);
    return true;
  });
}
