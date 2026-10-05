import { useState, useCallback } from 'react';
import type { HttpMethod, RequestOptions, ApiResponse, UseApiConfig } from '../types';

// POST, PUT, and DELETE. GET lives in useFetch because those requests run on their own.
// Login and register use this hook. Project and task changes will use it too.
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('Set VITE_API_URL in the Frontend .env file.');
}

// Prefer the API's { message } body, such as "Wrong password!", over a generic status.
async function errorMessage(response: Response) {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // The response body was not JSON.
  }

  return `Request failed (${response.status})`;
}

export function useApi<TData = unknown>(config?: UseApiConfig): ApiResponse<TData> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (
      url: string,
      method: HttpMethod,
      options: RequestOptions<unknown> = {}
    ): Promise<TData | null> => {
      setLoading(true);
      setError(null);

      try {
        // "/api/users/login" becomes "http://localhost:3000/api/users/login".
        // A full URL is left alone so a caller can override the host.
        const baseUrl = config?.baseUrl ?? API_URL;
        const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `${baseUrl}${url}`;

        // Protected routes need the JWT. Login and register pass no token.
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(config?.token ? { Authorization: `Bearer ${config.token}` } : {}),
          ...options.headers,
        };

        const response = await fetch(fullUrl, {
          method,
          headers,
          ...(options.body !== undefined && {
            body: JSON.stringify(options.body),
          }),
        });

        if (!response.ok) {
          throw new Error(await errorMessage(response));
        }

        const isJson = response.headers
          .get('content-type')
          ?.includes('application/json');
        const result: TData = isJson ? await response.json() : null;

        setData(result);
        return result;
      } catch (err) {
        const requestError =
          err instanceof Error ? err : new Error('An unknown error occurred');
        setError(requestError);
        // null tells the caller the request failed. The message is on `error`.
        return null;
      } finally {
        setLoading(false);
      }
    },
    [config?.token, config?.baseUrl]
  );

  const post = useCallback(
    <TBody,>(url: string, body?: TBody, headers?: Record<string, string>) =>
      execute(url, 'POST', { body, headers }),
    [execute]
  );

  const put = useCallback(
    <TBody,>(url: string, body?: TBody, headers?: Record<string, string>) =>
      execute(url, 'PUT', { body, headers }),
    [execute]
  );

  const del = useCallback(
    <TBody,>(url: string, body?: TBody, headers?: Record<string, string>) =>
      execute(url, 'DELETE', { body, headers }),
    [execute]
  );

  return { data, error, loading, execute, post, put, del };
}