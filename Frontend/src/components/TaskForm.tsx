// Collects the task fields, including priority, due date, and the people to assign.
import { useState, type FormEvent } from "react";
import Alert from "./Alert";
import ProfileAvatar from "./ProfileAvatar";
import Spinner from "./Spinner";
import type { TaskFormProps, TaskPriority, TaskStatus } from "../types";
import { TASK_PRIORITIES } from "../utils/taskFilters";

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done", "Hold"];

// Create or edit a task. Status must match the backend enum.
export default function TaskForm({
  initialValues,
  members,
  submitLabel,
  submitting = false,
  error = null,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? "To Do");
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "Medium");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [assignees, setAssignees] = useState<string[]>(initialValues?.assignees ?? []);
  const [formError, setFormError] = useState<string | null>(null);

  function toggleAssignee(userId: string) {
    setAssignees((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    setFormError(null);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null,
      assignees,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span>Title</span>
        <input
          className="field"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>
      <label className="block">
        <span>Description</span>
        <textarea
          className="field"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          required
        />
      </label>
      <label className="block">
        <span>Priority</span>
        <select
          className="field"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
        >
          {TASK_PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span>Due date</span>
        <input className="field" type="date" value={dueDate ?? ""} onChange={(event) => setDueDate(event.target.value)} />
      </label>
      <fieldset>
        <legend>Assign to</legend>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Select one or more people on this project.</p>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">No people are available to assign.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {members.map((member) => {
              const name = member.fullName || member.username;
              return (
                <li key={member._id}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={assignees.includes(member._id)}
                      onChange={() => toggleAssignee(member._id)}
                    />
                    <ProfileAvatar name={name} photo={member.profilePhoto} className="h-7 w-7 text-[10px]" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{name}</span>
                      {member.position && (
                        <span className="block truncate text-xs text-stone-500 dark:text-stone-400">{member.position}</span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>
      <label className="block">
        <span>Status</span>
        <select
          className="field"
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
        >
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <Alert message={formError ?? error} />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="rounded border border-stone-300 px-3 py-2 dark:border-stone-600" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded bg-teal-800 px-3 py-2 text-white disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? <Spinner label="Saving..." light /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
