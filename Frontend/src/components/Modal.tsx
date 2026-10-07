import { useEffect } from "react";
import type { ModalProps } from "../types";

// A small dialog. Closing it unmounts the form, so the fields start empty next time.
export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center overflow-y-auto bg-stone-900/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded bg-white p-4 text-stone-900 shadow-lg dark:bg-stone-900 dark:text-stone-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="rounded px-2 py-1 text-sm text-stone-500 dark:text-stone-400" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
