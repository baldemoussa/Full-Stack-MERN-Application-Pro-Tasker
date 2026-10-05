import { useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import type { ThemeProviderProps } from "../types";

// Holds darkMode for the whole app and wraps every page in the theme classes.
function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Use the previous value so two quick clicks cannot both read the same state.
  function toggleDarkMode() {
    setDarkMode((current) => !current);
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {/* The "dark" class is what Tailwind uses to turn on dark: styles. */}
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-app-bg font-nunito text-app-text dark:bg-app-dark-bg dark:text-white">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
