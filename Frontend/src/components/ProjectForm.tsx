// Collects a project name, description, and the people to invite on create or edit.
import { useState, type FormEvent } from "react";
import Alert from "./Alert";
import ProfileAvatar from "./ProfileAvatar";
import Spinner from "./Spinner";
import type { CollaboratorPermission, ProjectFormProps, ProjectInvite } from "../types";

function sameEmail(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

// Create or edit a project. Invites are saved with the project, not one request at a time.
export default function ProjectForm({
  initialValues,
  collaborators = [],
  canInvite = true,
  ownerEmail,
  submitLabel,
  submitting = false,
  error = null,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<CollaboratorPermission>("edit");
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const currentPeople = collaborators.filter((entry) => !removedIds.includes(entry.user._id));

  function inviteList(nextEmail: string, permissionValue: CollaboratorPermission): ProjectInvite[] | null {
    if (!nextEmail.includes("@")) {
      setFormError("Enter the email of a registered user.");
      return null;
    }
    if (ownerEmail && sameEmail(nextEmail, ownerEmail)) {
      setFormError("The owner is already on this project.");
      return null;
    }

    const alreadyThere = currentPeople.find((entry) => sameEmail(entry.user.email, nextEmail));
    if (alreadyThere) {
      setFormError("That person is already on this project.");
      return null;
    }

    const removed = collaborators.find(
      (entry) => removedIds.includes(entry.user._id) && sameEmail(entry.user.email, nextEmail),
    );
    if (removed) {
      setRemovedIds((current) => current.filter((id) => id !== removed.user._id));
      if (removed.permission === permissionValue) {
        return invites.filter((invite) => !sameEmail(invite.email, nextEmail));
      }
      return [
        ...invites.filter((invite) => !sameEmail(invite.email, nextEmail)),
        { email: removed.user.email, permission: permissionValue },
      ];
    }

    return [
      ...invites.filter((invite) => !sameEmail(invite.email, nextEmail)),
      { email: nextEmail, permission: permissionValue },
    ];
  }

  function addCollaborator() {
    const next = inviteList(email.trim(), permission);
    if (!next) {
      return;
    }
    setInvites(next);
    setEmail("");
    setFormError(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !description.trim()) {
      setFormError("Name and description are required.");
      return;
    }

    const typedEmail = email.trim();
    const nextInvites = canInvite && typedEmail ? inviteList(typedEmail, permission) : invites;
    if (!nextInvites) {
      return;
    }

    setFormError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      invites: canInvite ? nextInvites : [],
      removeCollaboratorIds: canInvite ? removedIds : [],
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span>Name</span>
        <input
          className="field"
          value={name}
          onChange={(event) => setName(event.target.value)}
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
      {canInvite && (
        <fieldset className="space-y-3">
          <legend>Collaborators</legend>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Add someone who already has an account. View can see the board. Edit can change tasks and the project name.
          </p>
          <div className="grid gap-2 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
            <label className="block">
              <span>Email</span>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCollaborator();
                  }
                }}
              />
            </label>
            <label className="block">
              <span>Permission</span>
              <select
                className="field"
                value={permission}
                onChange={(event) => setPermission(event.target.value as CollaboratorPermission)}
              >
                <option value="edit">Can edit</option>
                <option value="view">View only</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded border border-stone-300 px-3 py-2 dark:border-stone-600"
              onClick={addCollaborator}
              disabled={submitting}
            >
              Add
            </button>
          </div>
          {currentPeople.length > 0 && (
            <ul className="space-y-2">
              {currentPeople.map((entry) => {
                const label = entry.user.fullName || entry.user.username;
                return (
                  <li key={entry._id} className="flex items-center justify-between gap-3 rounded border border-stone-200 px-3 py-2 dark:border-stone-700">
                    <span className="flex min-w-0 items-center gap-2">
                      <ProfileAvatar name={label} photo={entry.user.profilePhoto} className="h-8 w-8" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{label}</span>
                        <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                          {entry.user.email} · {entry.permission === "edit" ? "Can edit" : "View only"}
                        </span>
                      </span>
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-sm text-red-700 dark:text-red-300"
                      onClick={() => setRemovedIds((current) => [...current, entry.user._id])}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {invites.length > 0 && (
            <ul className="space-y-2">
              {invites.map((invite) => (
                <li key={invite.email} className="flex items-center justify-between gap-3 rounded border border-dashed border-stone-300 px-3 py-2 dark:border-stone-600">
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{invite.email}</span>
                    <span className="block text-xs text-stone-500 dark:text-stone-400">
                      {invite.permission === "edit" ? "Can edit" : "View only"}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-sm text-red-700 dark:text-red-300"
                    onClick={() => setInvites((current) => current.filter((item) => item.email !== invite.email))}
                    disabled={submitting}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      )}
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
