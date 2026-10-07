import { useState, type FormEvent } from "react";
import Alert from "./Alert";
import Spinner from "./Spinner";
import type { TaskFormProps, TaskStatus } from "../types";

const STATUSES: TaskStatus[] = ["To Do", "In Progress", "Done"];

// Create or edit a task. Status must match the backend enum.
export default function TaskForm({
  initialValues,
  submitLabel,
  submitting = false,
  error = null,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? "To Do");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    setFormError(null);
    onSubmit({ title: title.trim(), description: description.trim(), status });
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
