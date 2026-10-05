import { createContext, useContext } from "react";
import type { AuthContextType } from "../types";

// The context is only the contract. AuthProvider fills in the real values.
// These defaults exist so a component can call useAuth() without crashing
// if it is rendered outside the provider. They do not log anyone in.
export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  submitting: false,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

// Pages call useAuth() instead of useContext(AuthContext) directly.
export function useAuth() {
  return useContext(AuthContext);
}
