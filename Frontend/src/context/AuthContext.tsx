import { createContext } from "react";
import type { AuthContextType } from "../types";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => console.warn("Login function"),
  logout: () => console.warn("Logout function"),
});
