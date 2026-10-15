import { useEffect, useState } from "react";
import Alert from "../components/Alert";
import BoardOverview from "../components/BoardOverview";
import AppHeader from "../components/AppHeader";
import CollaboratorForm from "../components/CollaboratorForm";
import Modal from "../components/Modal";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import Spinner from "../components/Spinner";
import TaskBoard from "../components/TaskBoard";
import TaskComments from "../components/TaskComments";
import TaskForm from "../components/TaskForm";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useFetch } from "../hooks/useFetch";
import type { ApiMessage, CollaboratorPermission, Project, ProjectBody, Task, TaskBody, TaskStatus } from "../types";
import { authHeaders } from "../utils/authHeaders";

const API_URL = import.meta.env.VITE_API_URL;

function projectStatus(project: Project) {
  return project.status ?? "active";
}

export default function DashboardPage() {
  const { token } = useAuth();
  const projectList = useFetch<Project[]>(
    token ? `${API_URL}/api/projects` : null,
    authHeaders(token)
  );
  const projectApi = useApi<Project>({ token });
  const projectDeleteApi = useApi<ApiMessage>({ token });
  const taskApi = useApi<Task>({ token });
  const taskDeleteApi = useApi<ApiMessage>({ token });
  const moveApi = useApi<Task>({ token });
  const inviteApi = useApi<Project>({ token });
  const statusApi = useApi<Project>({ token });
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [projectDeleteOpen, setProjectDeleteOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [commentTask, setCommentTask] = useState<Task | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const taskList = useFetch<Task[]>(
    token && selectedId ? `${API_URL}/api/projects/${selectedId}/tasks` : null,
    authHeaders(token)
  );

  // Replace the sidebar when GET /api/projects returns. Later creates and
  // updates change this list in place, so the sidebar does not wait for another GET.
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
      return list.find((project) => projectStatus(project) !== "archived")?._id ?? list[0]?._id ?? null;
    });
  }, [projectList.data]);

  // Drop the previous board as soon as another project is selected. The next
  // effect fills it when GET /api/projects/:id/tasks returns.
  useEffect(() => {
    setTasks([]);
  }, [selectedId]);

  useEffect(() => {
    if (taskList.data) {
      setTasks(taskList.data);
    }
  }, [taskList.data]);

  const selectedProject = projects.find((project) => project._id === selectedId) ?? null;

  function openCreateProject() {
    setEditingProject(false);
    setProjectFormOpen(true);
  }

  function openEditProject() {
    setEditingProject(true);
    setProjectFormOpen(true);
  }

  function openCreateTask() {
    setEditingTask(null);
    setTaskFormOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskFormOpen(true);
  }

  async function handleCreateProject(body: ProjectBody) {
    const created = await projectApi.post<ProjectBody>("/api/projects", body);
    if (!created) {
      return;
    }

    setProjects((current) => [...current, created]);
    setSelectedId(created._id);
    setProjectFormOpen(false);
  }

  async function handleUpdateProject(body: ProjectBody) {
    if (!selectedId) {
      return;
    }

    const updated = await projectApi.put<ProjectBody>(`/api/projects/${selectedId}`, body);
    if (!updated) {
      return;
    }

    setProjects((current) =>
      current.map((project) => (project._id === updated._id ? updated : project))
    );
    setProjectFormOpen(false);
  }

  async function handleDeleteProject() {
    if (!selectedProject) {
      return;
    }

    const removedId = selectedProject._id;
    const result = await projectDeleteApi.del(`/api/projects/${removedId}`);
    if (!result) {
      return;
    }

    const remaining = projects.filter((project) => project._id !== removedId);
    setProjects(remaining);
    setSelectedId(remaining[0]?._id ?? null);
    setProjectDeleteOpen(false);
  }

  async function handleSaveTask(body: TaskBody) {
    if (!selectedId) {
      return;
    }

    const saved = editingTask
      ? await taskApi.put<TaskBody>(`/api/projects/${selectedId}/tasks/${editingTask._id}`, body)
      : await taskApi.post<TaskBody>(`/api/projects/${selectedId}/tasks`, body);
    if (!saved) {
      return;
    }

    setTasks((current) =>
      editingTask
        ? current.map((task) => (task._id === saved._id ? saved : task))
        : [...current, saved]
    );
    setTaskFormOpen(false);
    setEditingTask(null);
  }

  async function handleDeleteTask() {
    if (!selectedId || !taskToDelete) {
      return;
    }

    const removedId = taskToDelete._id;
    const result = await taskDeleteApi.del(`/api/projects/${selectedId}/tasks/${removedId}`);
    if (!result) {
      return;
    }

    setTasks((current) => current.filter((task) => task._id !== removedId));
    setTaskToDelete(null);
  }

  async function handleMoveTask(task: Task, status: TaskStatus) {
    if (!selectedId || task.status === status) {
      return;
    }

    const previous = tasks;
    setTasks((current) =>
      current.map((item) => (item._id === task._id ? { ...item, status } : item))
    );
    const updated = await moveApi.put<TaskBody>(`/api/projects/${selectedId}/tasks/${task._id}`, {
      status,
    });
    if (!updated) {
      setTasks(previous);
      return;
    }
    setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
  }

  function replaceProject(updated: Project) {
    setProjects((current) =>
      current.map((project) => (project._id === updated._id ? updated : project))
    );
  }

  async function handleInvite(body: { email: string; permission: CollaboratorPermission }) {
    if (!selectedId) {
      return false;
    }
    const updated = await inviteApi.post<{ email: string; permission: CollaboratorPermission }>(
      `/api/projects/${selectedId}/collaborators`,
      body
    );
    if (!updated) {
      return false;
    }
    replaceProject(updated);
    return true;
  }

  async function handleProjectStatus(action: "close" | "archive" | "reopen") {
    if (!selectedId) {
      return;
    }
    const updated = await statusApi.put(`/api/projects/${selectedId}/${action}`);
    if (updated) {
      replaceProject(updated);
    }
  }

  async function handleRemoveCollaborator(userId: string) {
    if (!selectedId) {
      return;
    }
    const updated = await inviteApi.del<undefined>(
      `/api/projects/${selectedId}/collaborators/${userId}`
    );
    if (updated) {
      replaceProject(updated);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="max-h-56 overflow-y-auto border-b border-stone-200 p-4 dark:border-stone-700 md:max-h-none md:w-72 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2">
            <h1 className="min-w-0 text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">My projects</h1>
            <button
              type="button"
              className="shrink-0 rounded bg-teal-800 px-2 py-1 text-sm text-white"
              onClick={openCreateProject}
            >
              New project
            </button>
          </div>
          <Alert message={projectList.error} />
          {projectList.loading && projects.length === 0 ? (
            <p className="mt-3">
              <Spinner label="Loading projects..." />
            </p>
          ) : projects.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">No projects yet.</p>
          ) : (
            <div className="mt-3 space-y-4">
              <div className="space-y-2">
                {projects.filter((project) => projectStatus(project) !== "archived").length === 0 ? (
                  <p className="text-sm text-stone-500 dark:text-stone-400">No open projects.</p>
                ) : (
                  projects
                    .filter((project) => projectStatus(project) !== "archived")
                    .map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        selected={project._id === selectedProject?._id}
                        onSelect={setSelectedId}
                      />
                    ))
                )}
              </div>
              {projects.some((project) => projectStatus(project) === "archived") && (
                <div className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Archived</h2>
                  {projects
                    .filter((project) => projectStatus(project) === "archived")
                    .map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        selected={project._id === selectedProject?._id}
                        onSelect={setSelectedId}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </aside>
        <main className="flex min-w-0 flex-1 flex-col p-4">
          {selectedProject ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-semibold">{selectedProject.name}</h2>
                  <p className="mt-1 break-words text-stone-600 dark:text-stone-300">{selectedProject.description}</p>
                  {projectStatus(selectedProject) !== "active" && (
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                      This project is {projectStatus(selectedProject)}. The board is read only until the owner reopens it.
                    </p>
                  )}
                  {projectStatus(selectedProject) === "active" && selectedProject.access === "view" && (
                    <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                      View only. You can comment. Drag, edit, and delete stay with people who can edit.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.access === "owner" && projectStatus(selectedProject) === "active" && (
                    <button
                      type="button"
                      className="rounded border border-stone-300 px-3 py-2 text-sm dark:border-stone-600"
                      onClick={() => setShareOpen(true)}
                    >
                      Share
                    </button>
                  )}
                  {selectedProject.access !== "view" && projectStatus(selectedProject) === "active" && (
                    <button
                      type="button"
                      className="rounded border border-stone-300 px-3 py-2 text-sm dark:border-stone-600"
                      onClick={openEditProject}
                    >
                      Edit
                    </button>
                  )}
                  {selectedProject.access === "owner" && projectStatus(selectedProject) !== "archived" && (
                    <button
                      type="button"
                      className="rounded border border-stone-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-stone-600"
                      onClick={() => handleProjectStatus("archive")}
                      disabled={statusApi.loading}
                    >
                      Archive
                    </button>
                  )}
                  {selectedProject.access === "owner" && projectStatus(selectedProject) === "active" && (
                    <button
                      type="button"
                      className="rounded border border-stone-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-stone-600"
                      onClick={() => handleProjectStatus("close")}
                      disabled={statusApi.loading}
                    >
                      Close
                    </button>
                  )}
                  {selectedProject.access === "owner" && projectStatus(selectedProject) !== "active" && (
                    <button
                      type="button"
                      className="rounded bg-teal-800 px-3 py-2 text-sm text-white disabled:opacity-60"
                      onClick={() => handleProjectStatus("reopen")}
                      disabled={statusApi.loading}
                    >
                      Reopen
                    </button>
                  )}
                  {selectedProject.access === "owner" && (
                    <button
                      type="button"
                      className="rounded border border-red-200 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:text-red-300"
                      onClick={() => setProjectDeleteOpen(true)}
                    >
                      Delete
                    </button>
                  )}
                  {selectedProject.access !== "view" && projectStatus(selectedProject) === "active" && (
                    <button
                      type="button"
                      className="rounded bg-teal-800 px-3 py-2 text-sm text-white"
                      onClick={openCreateTask}
                    >
                      New task
                    </button>
                  )}
                </div>
              </div>
              <Alert message={taskList.error ?? statusApi.error?.message ?? (shareOpen ? null : moveApi.error?.message ?? null)} />
              {taskList.loading && tasks.length === 0 ? (
                <p className="mt-6">
                  <Spinner label="Loading tasks..." />
                </p>
              ) : (
                <>
                  <BoardOverview tasks={tasks} project={selectedProject} />
                  <TaskBoard
                    tasks={tasks}
                    canEdit={selectedProject.access !== "view" && projectStatus(selectedProject) === "active"}
                    onMove={handleMoveTask}
                    onEdit={openEditTask}
                    onDelete={setTaskToDelete}
                    onComment={setCommentTask}
                  />
                </>
              )}
            </div>
          ) : (
            <p className="text-stone-600 dark:text-stone-300">Create a project to open its board.</p>
          )}
        </main>
      </div>
      {projectFormOpen && (
        <Modal title={editingProject ? "Edit project" : "New project"} onClose={() => setProjectFormOpen(false)}>
          <ProjectForm
            key={editingProject ? selectedId ?? "edit" : "new"}
            initialValues={
              editingProject && selectedProject
                ? { name: selectedProject.name, description: selectedProject.description }
                : undefined
            }
            submitLabel={editingProject ? "Save changes" : "Create project"}
            submitting={projectApi.loading}
            error={projectApi.error?.message ?? null}
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={() => setProjectFormOpen(false)}
          />
        </Modal>
      )}
      {projectDeleteOpen && selectedProject && (
        <Modal title="Delete project" onClose={() => setProjectDeleteOpen(false)}>
          <p>Delete {selectedProject.name}? Its tasks and comments will be removed too.</p>
          <Alert message={projectDeleteApi.error?.message ?? null} />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 px-3 py-2 dark:border-stone-600"
              onClick={() => setProjectDeleteOpen(false)}
              disabled={projectDeleteApi.loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded bg-red-700 px-3 py-2 text-white disabled:opacity-60"
              onClick={handleDeleteProject}
              disabled={projectDeleteApi.loading}
            >
              {projectDeleteApi.loading ? <Spinner label="Deleting..." light /> : "Delete project"}
            </button>
          </div>
        </Modal>
      )}
      {taskFormOpen && selectedProject && (
        <Modal title={editingTask ? "Edit task" : "New task"} onClose={() => setTaskFormOpen(false)}>
          <TaskForm
            key={editingTask?._id ?? "new"}
            initialValues={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.status,
                  }
                : undefined
            }
            submitLabel={editingTask ? "Save changes" : "Create task"}
            submitting={taskApi.loading}
            error={taskApi.error?.message ?? null}
            onSubmit={handleSaveTask}
            onCancel={() => setTaskFormOpen(false)}
          />
        </Modal>
      )}
      {shareOpen && selectedProject && (
        <Modal title="Share project" onClose={() => setShareOpen(false)}>
          <CollaboratorForm
            collaborators={selectedProject.collaborators ?? []}
            submitting={inviteApi.loading}
            error={inviteApi.error?.message ?? null}
            onInvite={handleInvite}
            onRemove={handleRemoveCollaborator}
          />
        </Modal>
      )}
      {commentTask && selectedProject && (
        <Modal title={commentTask.title} onClose={() => setCommentTask(null)}>
          <TaskComments
            key={commentTask._id}
            projectId={selectedProject._id}
            taskId={commentTask._id}
            canModerate={selectedProject.access === "owner"}
            locked={projectStatus(selectedProject) !== "active"}
          />
        </Modal>
      )}
      {taskToDelete && (
        <Modal title="Delete task" onClose={() => setTaskToDelete(null)}>
          <p>Delete {taskToDelete.title}?</p>
          <Alert message={taskDeleteApi.error?.message ?? null} />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 px-3 py-2 dark:border-stone-600"
              onClick={() => setTaskToDelete(null)}
              disabled={taskDeleteApi.loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded bg-red-700 px-3 py-2 text-white disabled:opacity-60"
              onClick={handleDeleteTask}
              disabled={taskDeleteApi.loading}
            >
              {taskDeleteApi.loading ? <Spinner label="Deleting..." light /> : "Delete task"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
