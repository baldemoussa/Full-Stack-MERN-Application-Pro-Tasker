import { useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { useFetch } from "../hooks/useFetch";
import type { AuthProviderProps, AuthResponse, LoginBody, RegisterBody, SessionUser } from "../types";
import { authHeaders } from "../utils/authHeaders";
import { clearToken, getToken, setToken } from "../utils/token";

const API_URL = import.meta.env.VITE_API_URL;

// One place for the session. Login, register, logout, and route guards all read this.
function AuthProvider({ children }: AuthProviderProps) {
  // Read any token saved in this browser tab. A refresh keeps the session.
  // Closing the tab clears sessionStorage, so the next visit starts logged out.
  const [token, setTokenState] = useState<string | null>(getToken);

  // POST /api/users/login and POST /api/users/register. No token is required yet.
  const authApi = useApi<AuthResponse>();

  // GET /api/users/me proves the token still belongs to a user.
  // Pass null until a token exists so the request does not run too early.
  // SessionUser omits password because this route does not return it.
  const me = useFetch<SessionUser>(
    token ? `${API_URL}/api/users/me` : null,
    authHeaders(token),
  );

  // A stored token that the API rejects is removed. Otherwise a bad token
  // would leave the app on the loading screen.
  useEffect(() => {
    if (token && me.error) {
      clearToken();
      setTokenState(null);
    }
  }, [token, me.error]);

  // Login and register both return { token, user }. Keep the token in two places:
  // sessionStorage for the next refresh, and React state so the UI updates now.
  async function saveSession(result: AuthResponse | null) {
    if (!result?.token) {
      return false;
    }

    setToken(result.token);
    setTokenState(result.token);
    return true;
  }

  const login = (body: LoginBody) =>
    authApi.post("/api/users/login", body).then(saveSession);

  const register = (body: RegisterBody) =>
    authApi.post("/api/users/register", body).then(saveSession);

  // Logout is local. The API has no logout route. Deleting the token ends the session.
  const logout = () => {
    clearToken();
    setTokenState(null);
  };

  // Ignore a leftover /me response after logout. No token means no user.
  const user = token ? me.data : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        // True only after /api/users/me succeeds, not merely because a token exists.
        isAuthenticated: Boolean(user),
        // True while a token is waiting for /api/users/me. Route guards show "Loading..."
        // during this gap so they do not flash the login page.
        loading: token !== null && user === null && me.error === null,
        // True only while login or register is in flight. This does not unmount the form.
        submitting: authApi.loading,
        // The API message, for example "Wrong password!".
        error: authApi.error?.message ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
