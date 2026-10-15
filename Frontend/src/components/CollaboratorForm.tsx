import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import Alert from "./Alert";
import ProfileAvatar from "./ProfileAvatar";
import Spinner from "./Spinner";
import type { CollaboratorFormProps, CollaboratorPermission } from "../types";

export default function CollaboratorForm({
  collaborators,
  submitting,
  error,
  onInvite,
  onRemove,
}: CollaboratorFormProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<CollaboratorPermission>("edit");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setFormError("Enter the email of a registered user.");
      return;
    }

    setFormError(null);
    const ok = await onInvite({ email: email.trim(), permission });
    if (ok) {
      setEmail("");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600 dark:text-stone-300">
        Invite someone who already has an account. View can see the board. Edit can change tasks and the project name.
      </p>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span>Email</span>
          <input
            className="field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
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
        <Alert message={formError ?? error} />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded bg-teal-800 px-3 py-2 text-white disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? <Spinner label="Inviting..." light /> : "Invite"}
          </button>
        </div>
      </form>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {collaborators.map((entry) => (
            <motion.li
              key={entry._id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between gap-3 rounded border border-stone-200 px-3 py-2 dark:border-stone-700"
            >
              <span className="flex min-w-0 items-center gap-2">
                <ProfileAvatar
                  name={entry.user.fullName || entry.user.username}
                  photo={entry.user.profilePhoto}
                  className="h-8 w-8"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{entry.user.fullName || entry.user.username}</span>
                  <span className="block truncate text-sm text-stone-500 dark:text-stone-400">
                    {entry.user.position ? `${entry.user.position} · ${entry.user.email}` : entry.user.email}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-sm text-stone-500 dark:text-stone-400">
                {entry.permission === "edit" ? "Can edit" : "View only"}
              </span>
              <button
                type="button"
                className="shrink-0 text-sm text-red-700 dark:text-red-300"
                onClick={() => onRemove(entry.user._id)}
                disabled={submitting}
              >
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {collaborators.length === 0 && (
        <p className="text-sm text-stone-500 dark:text-stone-400">No collaborators yet.</p>
      )}
    </div>
  );
}
