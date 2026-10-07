import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, error, submitting } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim()) {
      setFormError("Enter a username.");
      return;
    }
    if (!email.includes("@")) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (password.length < 5) {
      setFormError("Password must be at least 5 characters.");
      return;
    }

    setFormError(null);
    const ok = await register({ username: username.trim(), email, password });
    if (ok) {
      navigate("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4 sm:p-6">
      <div className="w-full rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-xl font-semibold sm:text-2xl">Create an account</h1>
        <ThemeToggle />
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span>Username</span>
          <input
            className="field"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
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
          className="w-full rounded bg-teal-800 px-3 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4">
        <Link className="text-teal-800 underline dark:text-teal-300" to="/login">
          Already have an account? Log in
        </Link>
      </p>
      </div>
    </main>
  );
}
