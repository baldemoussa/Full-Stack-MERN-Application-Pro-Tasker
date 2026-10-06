import type { AlertProps } from "../types";

export default function Alert({ message }: AlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {message}
    </p>
  );
}
