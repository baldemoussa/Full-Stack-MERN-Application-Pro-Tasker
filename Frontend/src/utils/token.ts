const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY;

if (!TOKEN_KEY) {
  throw new Error("Set VITE_TOKEN_KEY in the Frontend .env file.");
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
