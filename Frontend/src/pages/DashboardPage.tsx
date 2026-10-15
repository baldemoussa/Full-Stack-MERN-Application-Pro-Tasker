// The signed-in home: project list, the selected board, and the dialogs for projects, tasks, sharing, and comments.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { ArchiveIcon, ChartIcon, IconButton, LockIcon, PencilIcon, PlusIcon, ReopenIcon, ShareIcon, TrashIcon } from "../components/Icons";
import BoardOverview from "../components/BoardOverview";
import AppHeader from "../components/AppHeader";
import CollaboratorForm from "../components/CollaboratorForm";
import Modal from "../components/Modal";
import ProjectCard from "../components/ProjectCard";
import ProjectForm from "../components/ProjectForm";
import Spinner from "../components/Spinner";
import TaskBoard from "../components/TaskBoard";
import TaskComments from "../components/TaskComments";
import TaskFilters from "../components/TaskFilters";
import TaskForm from "../components/TaskForm";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useFetch } from "../hooks/useFetch";
import type { ApiMessage, CollaboratorPermission, Project, ProjectBody, Task, TaskBody, TaskPriority, TaskStatus } from "../types";
import { authHeaders } from "../utils/authHeaders";
import { projectMembers } from "../utils/projectMembers";
import { matchesTask } from "../utils/taskFilters";

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
  const [projectQuery, setProjectQuery] = useState("");
  const [taskQuery, setTaskQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
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
    setTaskQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }, [selectedId]);

  useEffect(() => {
    if (taskList.data) {
      setTasks(taskList.data);
    }
  }, [taskList.data]);

  const selectedProject = projects.find((project) => project._id === selectedId) ?? null;
  const projectNeedle = projectQuery.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    if (!projectNeedle) {
      return true;
    }
    return `${project.name} ${project.description}`.toLowerCase().includes(projectNeedle);
  });
  const openProjects = visibleProjects.filter((project) => projectStatus(project) !== "archived");
  const archivedProjects = visibleProjects.filter((project) => projectStatus(project) === "archived");
  const visibleTasks = tasks.filter((task) => matchesTask(task, taskQuery, statusFilter, priorityFilter));

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

  // Create and edit share one form. The modal closes only after the API accepts the body.
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

  // The card moves immediately. A failed save puts it back in the column it left.
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
        <aside className="flex max-h-72 flex-col overflow-hidden border-b border-stone-200 p-4 dark:border-stone-700 md:max-h-none md:w-72 md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2">
            <h1 className="min-w-0 text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">My projects</h1>
            <IconButton
              label="New project"
              className="border-transparent bg-teal-800 text-white dark:border-transparent dark:text-white"
              onClick={openCreateProject}
            >
              <PlusIcon />
            </IconButton>
          </div>
          {projects.length > 0 && (
            <label className="mt-3 block">
              <span className="sr-only">Search projects</span>
              <input
                className="field"
                type="search"
                value={projectQuery}
                onChange={(event) => setProjectQuery(event.target.value)}
                placeholder="Search projects"
              />
            </label>
          )}
          <Alert message={projectList.error} />
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
            {projectList.loading && projects.length === 0 ? (
              <Spinner label="Loading projects..." />
            ) : projects.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">No projects yet.</p>
            ) : visibleProjects.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400">No projects match this search.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {openProjects.length === 0 ? (
                    projectNeedle && archivedProjects.length > 0 ? null : (
                      <p className="text-sm text-stone-500 dark:text-stone-400">No open projects.</p>
                    )
                  ) : (
                    openProjects.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        selected={project._id === selectedProject?._id}
                        onSelect={setSelectedId}
                      />
                    ))
                  )}
                </div>
                {archivedProjects.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Archived</h2>
                    {archivedProjects.map((project) => (
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
          </div>
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
                  <Link
                    to={`/analytics/${selectedProject._id}`}
                    aria-label="Analytics"
                    title="Analytics"
                    className="inline-flex shrink-0 items-center justify-center rounded border border-stone-300 p-2 text-stone-700 dark:border-stone-600 dark:text-stone-200"
                  >
                    <ChartIcon />
                  </Link>
                  {selectedProject.access === "owner" && projectStatus(selectedProject) === "active" && (
                    <IconButton label="Share" onClick={() => setShareOpen(true)}>
                      <ShareIcon />
                    </IconButton>
                  )}
                  {selectedProject.access !== "view" && projectStatus(selectedProject) === "active" && (
                    <IconButton label="Edit project" onClick={openEditProject}>
                      <PencilIcon />
                    </IconButton>
                  )}
                  {selectedProject.access === "owner" && projectStatus(selectedProject) !== "archived" && (
                    <IconButton label="Archive" onClick={() => handleProjectStatus("archive")} disabled={statusApi.loading}>
                      <ArchiveIcon />
                    </IconButton>
                  )}
                  {selectedProject.access === "owner" && projectStatus(selectedProject) === "active" && (
                    <IconButton label="Close project" onClick={() => handleProjectStatus("close")} disabled={statusApi.loading}>
                      <LockIcon />
                    </IconButton>
                  )}
                  {selectedProject.access === "owner" && projectStatus(selectedProject) !== "active" && (
                    <IconButton
                      label="Reopen"
                      className="border-transparent bg-teal-800 text-white dark:border-transparent dark:text-white"
                      onClick={() => handleProjectStatus("reopen")}
                      disabled={statusApi.loading}
                    >
                      <ReopenIcon />
                    </IconButton>
                  )}
                  {selectedProject.access === "owner" && (
                    <IconButton
                      label="Delete project"
                      className="border-red-200 text-red-700 dark:border-red-900 dark:text-red-300"
                      onClick={() => setProjectDeleteOpen(true)}
                    >
                      <TrashIcon />
                    </IconButton>
                  )}
                  {selectedProject.access !== "view" && projectStatus(selectedProject) === "active" && (
                    <IconButton
                      label="New task"
                      className="border-transparent bg-teal-800 text-white dark:border-transparent dark:text-white"
                      onClick={openCreateTask}
                    >
                      <PlusIcon />
                    </IconButton>
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
                  <TaskFilters
                    query={taskQuery}
                    status={statusFilter}
                    priority={priorityFilter}
                    shown={visibleTasks.length}
                    total={tasks.length}
                    onQuery={setTaskQuery}
                    onStatus={setStatusFilter}
                    onPriority={setPriorityFilter}
                    onClear={() => {
                      setTaskQuery("");
                      setStatusFilter("all");
                      setPriorityFilter("all");
                    }}
                  />
                  <TaskBoard
                    tasks={visibleTasks}
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
            members={projectMembers(selectedProject)}
            initialValues={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.status,
                    priority: editingTask.priority ?? "Medium",
                    dueDate: editingTask.dueDate ?? "",
                    assignees: (editingTask.assignees ?? []).map((person) => person._id),
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
