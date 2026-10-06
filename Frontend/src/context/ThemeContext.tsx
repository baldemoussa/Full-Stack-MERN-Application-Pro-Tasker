import { createContext, useContext } from "react";
import type { ThemeContextType } from "../types";

// Same split as auth: this file only publishes the theme contract.
// ThemeProvider owns the darkMode state.
export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Pages call useTheme() instead of useContext(ThemeContext) directly.
export function useTheme() {
  return useContext(ThemeContext);
}
