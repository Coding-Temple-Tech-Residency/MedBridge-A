// Thin fetch wrapper used by all feature hooks and API call helpers.
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
import {
  getAccessToken as getToken,
  setAccessToken as setToken,
  triggerForceLogout,
} from '@/features/auth/authToken';

type RequestOptions = Omit<RequestInit, 'body'> & {
  data?: unknown;
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshRes = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!refreshRes.ok) return null;

  const refreshData = (await refreshRes.json()) as { access_token?: string };
  return refreshData.access_token ?? null;
}

function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T }> {
  const { data, headers, _retry, ...rest } = options;
  const token = getToken();

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...headers,
    },
    body: data !== undefined ? JSON.stringify(data) : undefined,
    ...rest,
  });

  if (res.status === 401 && !_retry) {
    try {
      const refreshedToken = await refreshAccessTokenOnce();

      if (refreshedToken) {
        setToken(refreshedToken);
        return request<T>(method, path, { ...options, _retry: true });
      }
    } catch {
      // Fall through to forced logout when refresh fails due to network/server issues.
    }

    setToken(null);
    triggerForceLogout();
    throw { response: { status: 401, data: null } };
  }

  if (!res.ok) {
    throw {
      response: {
        status: res.status,
        data: await res.json().catch(() => null),
      },
    };
  }

  const json = res.status === 204 ? null : await res.json();
  return { data: json as T };
}

export const apiClient = {
  post: <T>(path: string, data?: unknown, options?: Omit<RequestOptions, 'data'>) =>
    request<T>('POST', path, { ...options, data }),
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
};

// Compatibility exports for existing code paths.
export function getAccessToken(): string | null {
  return getToken();
}

export function setAccessToken(token: string | null): void {
  setToken(token);
}

export function clearAccessToken(): void {
  setToken(null);
}
