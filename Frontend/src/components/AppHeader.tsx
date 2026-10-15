import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import PasswordForm from "./PasswordForm";
import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur dark:border-stone-700 dark:bg-stone-950/95">
      <p className="shrink-0 font-semibold">Pro-Tasker</p>
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <ProfileAvatar name={user?.fullName || user?.username || ""} photo={user?.profilePhoto} />
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-medium sm:text-base">{user?.fullName || user?.username}</span>
            {user?.position && (
              <span className="block truncate text-xs text-stone-500 dark:text-stone-400">{user.position}</span>
            )}
          </span>
        </span>
        <ThemeToggle />
        {user && (
          <>
            <button
              type="button"
              className="shrink-0 rounded border border-stone-300 px-3 py-2 text-sm dark:border-stone-600"
              onClick={() => setProfileOpen(true)}
            >
              Profile
            </button>
            <button
              type="button"
              className="shrink-0 rounded border border-stone-300 px-3 py-2 text-sm dark:border-stone-600"
              onClick={() => setPasswordOpen(true)}
            >
              Password
            </button>
          </>
        )}
        <button
          type="button"
          className="shrink-0 rounded bg-stone-900 px-3 py-2 text-sm text-white dark:bg-stone-100 dark:text-stone-900"
          onClick={logout}
        >
          Log out
        </button>
      </div>
      {profileOpen && (
        <Modal title="Edit profile" onClose={() => setProfileOpen(false)}>
          <ProfileForm onDone={() => setProfileOpen(false)} />
        </Modal>
      )}
      {passwordOpen && (
        <Modal title="Change password" onClose={() => setPasswordOpen(false)}>
          <PasswordForm onDone={() => setPasswordOpen(false)} />
        </Modal>
      )}
    </header>
  );
}
