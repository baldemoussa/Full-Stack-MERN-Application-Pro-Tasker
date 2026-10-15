// Email and password form. A successful login stores the token and opens the board.
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, error, submitting } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < 5) {
      setFormError("Password must be at least 5 characters.");
      return;
    }

    setFormError(null);
    const ok = await login({ email, password });
    if (ok) {
      navigate("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center p-4 sm:p-6">
      <div className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-700 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">Pro-Tasker</p>
          <h1 className="mt-1 text-2xl font-semibold">Log in</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Open the projects you own or were invited to.</p>
        </div>
        <ThemeToggle />
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
          <span>Password</span>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={5}
            required
          />
        </label>
        <Alert message={formError ?? error} />
        <button
          className="w-full rounded-lg bg-teal-800 px-3 py-2 font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4">
        <Link className="text-teal-800 underline dark:text-teal-300" to="/register">
          Need an account? Register
        </Link>
      </p>
      </div>
    </main>
  );
}
