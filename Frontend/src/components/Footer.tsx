export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-stone-200 px-4 py-3 text-center text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
      <p>
        © {year} Pro-Tasker.{" "}
        <a
          className="text-teal-800 underline dark:text-teal-300"
          href="https://www.linkedin.com/in/2mb/"
          target="_blank"
          rel="noreferrer"
        >
          Mamadou Moussa BALDE
        </a>
      </p>
    </footer>
  );
}
