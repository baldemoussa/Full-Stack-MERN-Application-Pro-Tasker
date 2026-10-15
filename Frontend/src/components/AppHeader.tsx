import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CloseIcon, KeyIcon, LogoutIcon, MenuIcon, UserIcon } from "./Icons";
import Modal from "./Modal";
import PasswordForm from "./PasswordForm";
import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function openProfile() {
    setMenuOpen(false);
    setProfileOpen(true);
  }

  function openPassword() {
    setMenuOpen(false);
    setPasswordOpen(true);
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur dark:border-stone-700 dark:bg-stone-950/95">
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
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded border border-stone-300 p-1.5 dark:border-stone-600"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="account-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
          {menuOpen && (
            <div
              id="account-menu"
              className="absolute right-0 top-full z-30 mt-2 w-48 rounded-lg border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900"
            >
              {user && (
                <>
                  <button type="button" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-800" onClick={openProfile}>
                    <UserIcon />
                    Profile
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-800" onClick={openPassword}>
                    <KeyIcon />
                    Password
                  </button>
                </>
              )}
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-stone-100 dark:text-red-300 dark:hover:bg-stone-800"
                onClick={logout}
              >
                <LogoutIcon />
                Log out
              </button>
            </div>
          )}
        </div>
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
