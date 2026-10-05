import { useEffect, useState } from "react";

// GET requests that should run when a URL exists, such as GET /api/users/me.
// Pass null for the URL to wait, for example until a token is available.
async function errorMessage(response: Response) {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // The response body was not JSON.
  }

  return `Request failed (${response.status})`;
}

export function useFetch<T>(url: string | null, headers?: HeadersInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState<string | null>(null);
  const headersKey = headers
    ? JSON.stringify(Object.fromEntries(new Headers(headers).entries()))
    : "";
  // A new object with the same Authorization value must not refetch forever.
  // Compare the header text, not the object identity.
  const requestKey = `${url ?? ""} ${headersKey}`;
  const [seenRequestKey, setSeenRequestKey] = useState(requestKey);

  // Clear the previous user as soon as the token or URL changes, before the
  // next request finishes. Otherwise logout could still show the old user.
  if (requestKey !== seenRequestKey) {
    setSeenRequestKey(requestKey);
    setData(null);
    setError(null);
    setLoading(Boolean(url));
  }

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const requestUrl = url;
    // Ignore a response that arrives after this effect has been replaced.
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(requestUrl, { headers });

        if (!response.ok) {
          throw new Error(await errorMessage(response));
        }

        const json = (await response.json()) as T;

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [url, headersKey]);

  return { data, loading, error };
}
