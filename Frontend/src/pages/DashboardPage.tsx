import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import Modal from "../components/Modal";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import TaskColumn from "../components/TaskColumn";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useFetch } from "../hooks/useFetch";
import type { Project, ProjectBody, TaskStatus } from "../types";
import { authHeaders } from "../utils/authHeaders";

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];
const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardPage() {
  const { token } = useAuth();
  const projectList = useFetch<Project[]>(
    token ? `${API_URL}/api/projects` : null,
    authHeaders(token)
  );
  const projectApi = useApi<Project>({ token });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Replace the sidebar when GET /api/projects returns. A project created
  // after that is added in handleCreate, so it shows without another request.
  useEffect(() => {
    const list = projectList.data;
    if (!list) {
      return;
    }

    setProjects(list);
    setSelectedId((current) => {
      if (current && list.some((project) => project._id === current)) {
        return current;
      }
      return list[0]?._id ?? null;
    });
  }, [projectList.data]);

  const selectedProject = projects.find((project) => project._id === selectedId) ?? null;

  async function handleCreate(body: ProjectBody) {
    const created = await projectApi.post<ProjectBody>("/api/projects", body);
    if (!created) {
      return;
    }

    setProjects((current) => [...current, created]);
    setSelectedId(created._id);
    setFormOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-stone-200 p-4 md:w-72 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-stone-500">My projects</h1>
            <button
              type="button"
              className="rounded bg-teal-800 px-2 py-1 text-sm text-white"
              onClick={() => setFormOpen(true)}
            >
              New project
            </button>
          </div>
          <Alert message={projectList.error} />
          {projectList.loading && projects.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">No projects yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  selected={project._id === selectedProject?._id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </aside>
        <main className="flex-1 p-4">
          {selectedProject ? (
            <>
              <h2 className="text-2xl font-semibold">{selectedProject.name}</h2>
              <p className="mt-1 text-stone-600">{selectedProject.description}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {STATUSES.map((status) => (
                  <TaskColumn key={status} status={status} tasks={[]} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-stone-600">Create a project to open its board.</p>
          )}
        </main>
      </div>
      {formOpen && (
        <Modal title="New project" onClose={() => setFormOpen(false)}>
          <ProjectForm
            submitLabel="Create project"
            submitting={projectApi.loading}
            error={projectApi.error?.message ?? null}
            onSubmit={handleCreate}
            onCancel={() => setFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
