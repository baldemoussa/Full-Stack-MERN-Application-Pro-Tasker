// Saves light or night mode and puts the dark class where Tailwind can see it.
import { useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import type { ThemeProviderProps } from "../types";

// Holds darkMode for the whole app and wraps every page in the theme classes.
const THEME_KEY = "pro-tasker-theme";

function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === "dark");

  // Use the previous value so two quick clicks cannot both read the same state.
  function toggleDarkMode() {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {/* The "dark" class is what Tailwind uses to turn on dark: styles. */}
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-200 text-stone-900 [color-scheme:light] dark:from-stone-950 dark:to-stone-900 dark:text-stone-100 dark:[color-scheme:dark]">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
