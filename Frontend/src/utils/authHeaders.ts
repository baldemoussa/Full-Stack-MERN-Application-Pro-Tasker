export function authHeaders(token: string | null) {
  if (!token) {
    return undefined;
  }

  return { Authorization: `Bearer ${token}` };
}
