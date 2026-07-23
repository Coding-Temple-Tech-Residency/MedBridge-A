/**
 * Raw API call functions for auth endpoints.
 *
 * These are plain async functions with no React dependency.
 * They are consumed by the React Query hooks in `hooks.ts` but can also be
 * called independently (e.g. in tests or non-component code).
 */

import { apiClient } from '../../api/client';

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
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
  return res.data;
}

/** POST /api/v1/auth/register */
export async function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
  return res.data;
}

/**
 * POST /api/v1/auth/logout
 *
 * Returns void — the server responds with 204 No Content on success.
 */
export async function logoutApi(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

/** GET /api/v1/auth/me */
export async function getCurrentUserApi(): Promise<User> {
  const res = await apiClient.get<User>('/api/v1/auth/me');
  return res.data;
}
