import { useAuth } from "../context/AuthContext";
import ProfileAvatar from "./ProfileAvatar";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { user, logout } = useAuth();

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
        <button
          type="button"
          className="shrink-0 rounded bg-stone-900 px-3 py-2 text-sm text-white dark:bg-stone-100 dark:text-stone-900"
          onClick={logout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
