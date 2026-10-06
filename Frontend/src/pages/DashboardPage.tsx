import { useState } from "react";
import AppHeader from "../components/AppHeader";
import ProjectCard from "../components/ProjectCard";
import TaskColumn from "../components/TaskColumn";
import type { Project, Task, TaskStatus } from "../types";

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];

// Sample records so the layout can be reviewed before connects the API.
const projects: Project[] = [
  {
    _id: "project-website",
    name: "Website Redesign",
    description: "Refresh the marketing site",
    user: "sample-user",
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "project-mobile",
    name: "Mobile App v2",
    description: "Ship the next release",
    user: "sample-user",
    createdAt: "",
    updatedAt: "",
  },
];

const tasks: Task[] = [
  {
    _id: "task-1",
    title: "Audit the current pages",
    description: "List every page that needs a new layout",
    status: "To Do",
    project: "project-website",
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "task-2",
    title: "Design the homepage",
    description: "Draft the hero, features, and footer",
    status: "In Progress",
    project: "project-website",
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "task-3",
    title: "Write the launch checklist",
    description: "Confirm hosting, forms, and analytics",
    status: "Done",
    project: "project-website",
    createdAt: "",
    updatedAt: "",
  },
  {
    _id: "task-4",
    title: "Review the navigation",
    description: "Check the tab bar on a small screen",
    status: "To Do",
    project: "project-mobile",
    createdAt: "",
    updatedAt: "",
  },
];

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState(projects[0]._id);
  const selectedProject = projects.find((project) => project._id === selectedId) ?? projects[0];
  const projectTasks = tasks.filter((task) => task.project === selectedProject._id);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-stone-200 p-4 md:w-72 md:border-b-0 md:border-r">
          <h1 className="text-sm font-semibold uppercase tracking-wide text-stone-500">My projects</h1>
          <div className="mt-3 space-y-2">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                selected={project._id === selectedProject._id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4">
          <h2 className="text-2xl font-semibold">{selectedProject.name}</h2>
          <p className="mt-1 text-stone-600">{selectedProject.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {STATUSES.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={projectTasks.filter((task) => task.status === status)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
