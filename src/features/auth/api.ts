/**
 * Raw API call functions for auth endpoints.
 *
 * These are plain async functions with no React dependency.
 * They are consumed by the React Query hooks in `hooks.ts` but can also be
 * called independently (e.g. in tests or non-component code).
 */

import { apiFetch } from '../../api/client';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
}

// ── Request / response shapes ─────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export type RegisterResponse = User;

// ── API functions ─────────────────────────────────────────────────────────────

/** POST /api/v1/auth/login */
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

/** POST /api/v1/auth/register */
export async function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

/**
 * POST /api/v1/auth/logout
 *
 * Returns void — the server responds with 204 No Content on success.
 */
export async function logoutApi(): Promise<void> {
  return apiFetch<void>('/api/v1/auth/logout', { method: 'POST' });
}

/** GET /api/v1/users/me */
export async function getCurrentUserApi(): Promise<User> {
  return apiFetch<User>('/api/v1/users/me');
}
