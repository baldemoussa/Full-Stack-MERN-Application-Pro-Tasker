import { useState, type FormEvent } from "react";
import Alert from "./Alert";
import ProfileAvatar from "./ProfileAvatar";
import Spinner from "./Spinner";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import type { ProfileBody, SessionUser } from "../types";
import { resizeProfilePhoto } from "../utils/profilePhoto";

export default function ProfileForm({ onDone }: { onDone: () => void }) {
  const { token, user, replaceUser } = useAuth();
  const profileApi = useApi<SessionUser>({ token });
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto ?? "");
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !position.trim() || !username.trim()) {
      setFormError("Full name, position, and username are required.");
      setSaved(false);
      return;
    }
    if (!email.includes("@")) {
      setFormError("Enter a valid email address.");
      setSaved(false);
      return;
    }

    setFormError(null);
    const body: ProfileBody = {
      fullName: fullName.trim(),
      position: position.trim(),
      username: username.trim(),
      email: email.trim(),
      profilePhoto,
    };
    const updated = await profileApi.put<ProfileBody>("/api/users/me", body);
    if (!updated) {
      setSaved(false);
      return;
    }

    replaceUser(updated);
    setSaved(true);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-3">
        <ProfileAvatar name={fullName || username} photo={profilePhoto} className="h-16 w-16 text-base" />
        <div className="min-w-0">
          <p className="truncate font-medium">{fullName || "Your name"}</p>
          <p className="truncate text-sm text-stone-500 dark:text-stone-400">{position || "Your position"}</p>
        </div>
      </div>
      <label className="block">
        <span>Full name</span>
        <input className="field" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>
      <label className="block">
        <span>Position</span>
        <input className="field" value={position} onChange={(event) => setPosition(event.target.value)} required />
      </label>
      <label className="block">
        <span>Username</span>
        <input className="field" value={username} onChange={(event) => setUsername(event.target.value)} required />
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
        <span>Profile photo</span>
        <input
          className="field"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            setReadingPhoto(true);
            setFormError(null);
            setSaved(false);
            void resizeProfilePhoto(file).then(
              (photo) => {
                setProfilePhoto(photo);
                setReadingPhoto(false);
              },
              (reason: unknown) => {
                setReadingPhoto(false);
                setFormError(reason instanceof Error ? reason.message : "Could not read that photo.");
                event.target.value = "";
              },
            );
          }}
        />
      </label>
      {profilePhoto && (
        <button
          type="button"
          className="text-sm text-red-700 dark:text-red-300"
          onClick={() => {
            setProfilePhoto("");
            setSaved(false);
          }}
        >
          Remove photo
        </button>
      )}
      <Alert message={formError ?? profileApi.error?.message ?? null} />
      {saved && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          Profile updated.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded border border-stone-300 px-3 py-2 dark:border-stone-600"
          onClick={onDone}
          disabled={profileApi.loading || readingPhoto}
        >
          Close
        </button>
        <button
          type="submit"
          className="rounded bg-teal-800 px-3 py-2 text-white disabled:opacity-60"
          disabled={profileApi.loading || readingPhoto}
        >
          {readingPhoto ? (
            <Spinner label="Reading photo..." light />
          ) : profileApi.loading ? (
            <Spinner label="Saving..." light />
          ) : (
            "Save profile"
          )}
        </button>
      </div>
    </form>
  );
}
