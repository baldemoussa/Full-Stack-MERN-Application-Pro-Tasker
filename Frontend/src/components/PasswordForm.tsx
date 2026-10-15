import { useState, type FormEvent } from "react";
import Alert from "./Alert";
import Spinner from "./Spinner";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import type { ApiMessage } from "../types";

export default function PasswordForm({ onDone }: { onDone: () => void }) {
  const { token } = useAuth();
  const passwordApi = useApi<ApiMessage>({ token });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 5) {
      setFormError("Password must be at least 5 characters.");
      setSaved(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("New password and confirmation do not match.");
      setSaved(false);
      return;
    }
    if (currentPassword === newPassword) {
      setFormError("Choose a different password.");
      setSaved(false);
      return;
    }

    setFormError(null);
    const result = await passwordApi.put("/api/users/me/password", { currentPassword, newPassword });
    if (!result) {
      setSaved(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span>Current password</span>
        <input
          className="field"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <label className="block">
        <span>New password</span>
        <input
          className="field"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={5}
          required
        />
      </label>
      <label className="block">
        <span>Confirm new password</span>
        <input
          className="field"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={5}
          required
        />
      </label>
      <Alert message={formError ?? passwordApi.error?.message ?? null} />
      {saved && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          Password updated.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded border border-stone-300 px-3 py-2 dark:border-stone-600"
          onClick={onDone}
          disabled={passwordApi.loading}
        >
          Close
        </button>
        <button
          type="submit"
          className="rounded bg-teal-800 px-3 py-2 text-white disabled:opacity-60"
          disabled={passwordApi.loading}
        >
          {passwordApi.loading ? <Spinner label="Saving..." light /> : "Save password"}
        </button>
      </div>
    </form>
  );
}
