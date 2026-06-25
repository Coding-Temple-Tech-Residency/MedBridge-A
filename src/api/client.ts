// Thin fetch wrapper used by all feature hooks.
//
// - Base URL is read from the validated env config.
// - `credentials: 'include'` ensures the HttpOnly refresh-token cookie is
//   sent automatically on every request (including /auth/refresh).
// - Access token injection is handled by the caller via the Authorization
//   header helper below.
//
// NOTE: This is a minimal stub. Replace with a full client (e.g. axios, or a
// richer fetch wrapper) once the FE-08 API-contract sync is complete and the
// shared infrastructure is agreed with FE-04.

import { env } from '@/env';

type RequestOptions = Omit<RequestInit, 'body'> & {
  data?: unknown;
};

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<{ data: T }> {
  const { data, headers, ...rest } = options;

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const error: { response: { status: number; data: unknown } } = {
      response: {
        status: res.status,
        data: await res.json().catch(() => null),
      },
    };
    throw error;
  }

  const json = res.status === 204 ? null : await res.json();
  return { data: json as T };
}

export const apiClient = {
  post: <T>(path: string, data?: unknown, options?: Omit<RequestOptions, 'data'>) =>
    request<T>('POST', path, { ...options, data }),
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),
};
