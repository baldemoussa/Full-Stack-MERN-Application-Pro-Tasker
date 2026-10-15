// Creates an account, including the optional profile photo, then opens the board.
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { resizeProfilePhoto } from "../utils/profilePhoto";

export default function RegisterPage() {
  const { register, error, submitting } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim()) {
      setFormError("Enter your full name.");
      return;
    }
    if (!position.trim()) {
      setFormError("Enter your position.");
      return;
    }
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
    const ok = await register({
      username: username.trim(),
      fullName: fullName.trim(),
      position: position.trim(),
      profilePhoto,
      email,
      password,
    });
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
          <h1 className="mt-1 text-2xl font-semibold">Create an account</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Start a board, then invite the people who will work on it.</p>
        </div>
        <ThemeToggle />
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span>Full name</span>
          <input
            className="field"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span>Position</span>
          <input
            className="field"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span>Profile photo</span>
          <input
            className="field"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setProfilePhoto("");
                return;
              }
              setReadingPhoto(true);
              setFormError(null);
              void resizeProfilePhoto(file).then(
                (photo) => {
                  setProfilePhoto(photo);
                  setReadingPhoto(false);
                },
                (reason: unknown) => {
                  setProfilePhoto("");
                  setReadingPhoto(false);
                  setFormError(reason instanceof Error ? reason.message : "Could not read that photo.");
                  event.target.value = "";
                },
              );
            }}
          />
          {profilePhoto && (
            <img src={profilePhoto} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />
          )}
        </label>
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
          className="w-full rounded-lg bg-teal-800 px-3 py-2 font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={submitting || readingPhoto}
        >
          {submitting ? "Creating account..." : readingPhoto ? "Reading photo..." : "Create account"}
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
