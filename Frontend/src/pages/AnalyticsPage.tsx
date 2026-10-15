// Charts and counts for one project. The project menu switches the address.
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { StatusPie, TrendLine } from "../components/AnalyticsCharts";
import Alert from "../components/Alert";
import AppHeader from "../components/AppHeader";
import ProfileAvatar from "../components/ProfileAvatar";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import type { Project, Task, TaskPriority, TaskStatus } from "../types";
import { authHeaders } from "../utils/authHeaders";
import { analyzeProject } from "../utils/projectAnalytics";

const API_URL = import.meta.env.VITE_API_URL;

const statusTone: Record<TaskStatus, string> = {
  "To Do": "bg-stone-400 dark:bg-stone-500",
  "In Progress": "bg-amber-500",
  Done: "bg-emerald-600",
  Hold: "bg-sky-500",
};

const statusFill: Record<TaskStatus, string> = {
  "To Do": "#a8a29e",
  "In Progress": "#f59e0b",
  Done: "#059669",
  Hold: "#0ea5e9",
};

const priorityTone: Record<TaskPriority, string> = {
  Low: "bg-stone-400 dark:bg-stone-500",
  Medium: "bg-amber-500",
  High: "bg-rose-500",
};

function share(count: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((count / total) * 100);
}

function Meter({ label, count, total, tone }: { label: string; count: number; total: number; tone: string }) {
  const width = share(count, total);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="text-stone-500 dark:text-stone-400">
          {count} · {width}%
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const reduceMotion = useReducedMotion();
  const projectList = useFetch<Project[]>(token ? `${API_URL}/api/projects` : null, authHeaders(token));
  const taskList = useFetch<Task[]>(
    token && projectId ? `${API_URL}/api/projects/${projectId}/tasks` : null,
    authHeaders(token),
  );
  const projects = projectList.data ?? [];
  const project = projects.find((item) => item._id === projectId) ?? null;
  const tasks = taskList.data ?? [];
  const stats = analyzeProject(tasks);

  useEffect(() => {
    if (projectId || !projectList.data?.length) {
      return;
    }
    const next = projectList.data.find((item) => (item.status ?? "active") !== "archived") ?? projectList.data[0];
    navigate(`/analytics/${next._id}`, { replace: true });
  }, [navigate, projectId, projectList.data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <p>
          <Link className="text-sm text-teal-800 underline dark:text-teal-300" to="/dashboard">
            Back to the board
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Numbers for the selected project.</p>
          </div>
          {projects.length > 0 && (
            <label className="block sm:w-72">
              <span className="text-sm text-stone-600 dark:text-stone-300">Project</span>
              <select
                className="field"
                value={projectId ?? ""}
                onChange={(event) => navigate(`/analytics/${event.target.value}`)}
              >
                {projects.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                    {item.status && item.status !== "active" ? ` (${item.status})` : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <Alert message={projectList.error ?? taskList.error} />
        {projectList.loading && projects.length === 0 ? (
          <p className="mt-6">
            <Spinner label="Loading projects..." />
          </p>
        ) : projects.length === 0 ? (
          <p className="mt-6 text-stone-600 dark:text-stone-300">Create a project on the board to see its analytics.</p>
        ) : projectList.data && !project ? (
          <p className="mt-6 text-stone-600 dark:text-stone-300">That project is not available.</p>
        ) : taskList.loading && !taskList.data ? (
          <p className="mt-6">
            <Spinner label="Loading analytics..." />
          </p>
        ) : (
          project && (
            <div className="mt-6 space-y-6">
              <div>
                <h2 className="break-words text-xl font-semibold">{project.name}</h2>
                <p className="mt-1 break-words text-stone-600 dark:text-stone-300">{project.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "Tasks", value: String(stats.total) },
                  { label: "Completion", value: `${stats.completion}%` },
                  { label: "Assigned", value: String(stats.assigned) },
                  { label: "Overdue", value: String(stats.overdue) },
                  { label: "High and open", value: String(stats.highOpen) },
                ].map((card, index) => (
                  <motion.div
                    key={card.label}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.06 }}
                    className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{card.label}</p>
                    <p className="mt-1 text-3xl font-black">{card.value}</p>
                  </motion.div>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Status</h3>
                  <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                    <StatusPie
                      slices={stats.byStatus.map((slice) => ({
                        label: slice.status,
                        count: slice.count,
                        color: statusFill[slice.status],
                      }))}
                    />
                    <div className="w-full flex-1 space-y-3">
                      {stats.byStatus.map((slice) => (
                        <Meter key={slice.status} label={slice.status} count={slice.count} total={stats.total} tone={statusTone[slice.status]} />
                      ))}
                    </div>
                  </div>
                </section>
                <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Tasks added</h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">How many tasks the project had on each of the last 14 days.</p>
                  <div className="mt-3">
                    <TrendLine points={stats.trend} />
                  </div>
                </section>
              </div>
              <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Priority</h3>
                <div className="mt-4 space-y-3">
                  {stats.byPriority.map((slice) => (
                    <Meter key={slice.priority} label={slice.priority} count={slice.count} total={stats.total} tone={priorityTone[slice.priority]} />
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Assignments</h3>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  {stats.unassigned} {stats.unassigned === 1 ? "task is" : "tasks are"} unassigned.
                  {stats.total > 0 ? ` ${stats.done} of ${stats.total} ${stats.total === 1 ? "is" : "are"} done.` : ""}
                </p>
                {stats.workload.length === 0 ? (
                  <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">No one is assigned yet.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {stats.workload.map((row) => {
                      const busiest = stats.workload[0]?.total || 1;
                      const doneShare = row.total === 0 ? 0 : Math.round((row.done / row.total) * 100);
                      return (
                        <li key={row.id}>
                          <div className="flex items-center gap-3">
                            <ProfileAvatar name={row.name} photo={row.photo} className="h-8 w-8 text-[10px]" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{row.name}</span>
                              <span className="block text-xs text-stone-500 dark:text-stone-400">
                                {row.total} {row.total === 1 ? "task" : "tasks"}, {row.done} done
                              </span>
                            </span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800" style={{ width: `${share(row.total, busiest)}%` }}>
                            <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${doneShare}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          )
        )}
      </main>
    </div>
  );
}
