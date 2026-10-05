import { createContext } from "react";
import type { ThemeContextType } from "../types";

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});
