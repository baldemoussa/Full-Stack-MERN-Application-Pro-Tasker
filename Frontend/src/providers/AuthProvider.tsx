import { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import type { AuthProviderProps, User } from "../types";

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>({
    _id: "101",
    username: "SoloDev101",
    email: "",
    password: "",
    role: "user",
    createdAt: "",
    updatedAt: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (username: string) => {
    setUser({
      _id: username,
      username,
      email: "",
      password: "",
      role: "user",
      createdAt: "",
      updatedAt: "",
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
