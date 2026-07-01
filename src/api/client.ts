/**
 * Base HTTP client for all API calls.
 *
 * Responsibilities:
 *  - Attach the Authorization header using the access token from localStorage.
 *  - On a 401, attempt a silent token refresh via the httpOnly refresh cookie.
 *    If the refresh succeeds the original request is retried once with the new token.
 *    If the refresh fails the token is cleared and the user is redirected to /login.
 *  - Parse error bodies and throw an `ApiError` so every caller gets consistent error
 *    shapes regardless of which endpoint failed.
 */

import { env } from '../env';
import { ApiError } from './errors';

// ── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Internal ──────────────────────────────────────────────────────────────────

type RequestOptions = RequestInit & {
  /** Skip attaching the Authorization header (e.g. login / register). */
  skipAuth?: boolean;
};

/**
 * Call `/auth/refresh` and return the new access token, or null if the refresh
 * cookie is missing / expired.
 */
async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // the httpOnly refresh cookie rides along automatically
  });

  if (!response.ok) return null;

  const data: { access_token: string } = await response.json();
  return data.access_token ?? null;
}

// In-flight refresh promise, shared across concurrent 401s so only one
// `/auth/refresh` request goes out at a time. Without this, concurrent 401s
// each call refreshAccessToken() independently, and the second call reuses a
// refresh token already consumed by the first — tripping BE reuse-detection.
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Internal fetch wrapper that handles token injection and the one-time retry
 * after a successful token refresh.
 */
async function apiFetchInner(
  path: string,
  options: RequestOptions = {},
  canRetry = true,
): Promise<Response> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers,
    credentials: 'include',
  });

  // Silent refresh on 401 — only try once.
  if (response.status === 401 && canRetry && !skipAuth) {
    const newToken = await refreshAccessTokenOnce();

    if (newToken) {
      setAccessToken(newToken);
      return apiFetchInner(path, options, false);
    }

    // Refresh token is gone — session is over.
    clearAccessToken();
    window.location.href = '/login';
  }

  return response;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Typed fetch helper.
 *
 * Usage:
 *   const user = await apiFetch<User>('/api/v1/auth/me');
 *   await apiFetch<void>('/api/v1/auth/logout', { method: 'POST' });
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await apiFetchInner(path, options);

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body: { detail?: string } = await response.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch {
      // Non-JSON error body — fall back to the generic message above.
    }
    throw new ApiError(response.status, detail);
  }

  // 204 No Content — valid success with no body.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
