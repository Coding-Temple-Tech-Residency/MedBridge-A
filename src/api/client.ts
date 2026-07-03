// Thin fetch wrapper used by all feature hooks.
//
// - Base URL is read from the validated env config.
// - `credentials: 'include'` ensures the HttpOnly refresh-token cookie is
//   sent automatically on every request (including /api/v1/auth/refresh).
// - Access tokens are injected via the Authorization header on every request.
// - On a 401 response, the client silently attempts a token refresh. If the
//   refresh succeeds the original request is retried. If the refresh also
//   fails, the client triggers a forced logout (via authToken callbacks) and
//   the user is redirected to the login screen with a session-expired notice.

import { env } from '@/env';
import { getAccessToken, setAccessToken, triggerForceLogout } from '@/features/auth/authToken';

type RequestOptions = Omit<RequestInit, 'body'> & {
  data?: unknown;
  _retry?: boolean;
};

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T }> {
  const { data, headers, _retry, ...rest } = options;

  const token = getAccessToken();

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
    ...rest,
  });

  // Attempt a silent token refresh on 401, then retry once.
  if (res.status === 401 && !_retry) {
    try {
      const refreshRes = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = (await refreshRes.json()) as { access_token: string };
        setAccessToken(refreshData.access_token);
        return request<T>(method, path, { ...options, _retry: true });
      }
    } catch {
      // Network error during refresh — fall through to force logout
    }

    // Refresh failed: clear the session and redirect to login
    setAccessToken(null);
    triggerForceLogout();
    throw { response: { status: 401, data: null } };
  }

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
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
};
