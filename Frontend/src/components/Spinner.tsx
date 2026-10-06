import type { SpinnerProps } from "../types";

// Shown while a list is loading or a save/delete request is still running.
export default function Spinner({ label, light = false }: SpinnerProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${light ? "text-white" : "text-sm text-stone-500"}`} role="status">
      <span
        className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
          light ? "border-white/40 border-t-white" : "border-stone-300 border-t-teal-800"
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
