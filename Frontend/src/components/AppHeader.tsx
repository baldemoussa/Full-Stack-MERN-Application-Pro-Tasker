import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
      <p className="font-semibold">Pro-Tasker</p>
      <div className="flex items-center gap-3">
        <span>{user?.username}</span>
        <ThemeToggle />
        <button
          type="button"
          className="rounded bg-stone-900 px-3 py-1 text-white dark:bg-stone-100 dark:text-stone-900"
          onClick={logout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
