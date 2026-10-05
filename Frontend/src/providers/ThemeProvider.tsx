import { useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import type { ThemeProviderProps } from "../types";

function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);

  function toggleDarkMode() {
    setDarkMode((current) => !current);
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-app-bg font-nunito text-app-text dark:bg-app-dark-bg dark:text-white">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
