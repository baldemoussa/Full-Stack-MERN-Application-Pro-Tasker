import { useState, type FormEvent } from "react";
import Alert from "./Alert";
import Spinner from "./Spinner";
import type { ProjectFormProps } from "../types";

// Create or edit a project. The parent sends the body to the API.
export default function ProjectForm({
  initialValues,
  submitLabel,
  submitting = false,
  error = null,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !description.trim()) {
      setFormError("Name and description are required.");
      return;
    }

    setFormError(null);
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span>Name</span>
        <input
          className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label className="block">
        <span>Description</span>
        <textarea
          className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          required
        />
      </label>
      <Alert message={formError ?? error} />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="rounded px-3 py-2" onClick={onCancel} disabled={submitting}>
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
