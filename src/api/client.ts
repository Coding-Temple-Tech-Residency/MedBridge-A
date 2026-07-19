// Thin fetch wrapper used by auth hooks and API call helpers.
//
// - Base URL comes from validated env config.
// - `credentials: 'include'` ensures the HttpOnly refresh-token cookie is sent.
// - Access tokens are injected via Authorization on every request.
// - On 401, the client attempts one silent refresh and retries once.

import { env } from '@/env';
import { getAccessToken as getToken, setAccessToken as setToken, triggerForceLogout } from '@/features/auth/authToken';

type RequestOptions = Omit<RequestInit, 'body'> & {
  data?: unknown;
  formData?: FormData;
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
  const { data, formData, headers, _retry, ...rest } = options;
  const token = getToken();
  const isFormDataRequest = formData !== undefined;

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(!isFormDataRequest ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormDataRequest
      ? formData
      : data !== undefined
        ? JSON.stringify(data)
        : undefined,
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

  upload: <T>(
    path: string,
    formData: FormData,
    options?: Omit<RequestOptions, 'data' | 'formData'>,
  ) => request<T>('POST', path, { ...options, formData }),

  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),
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
