/**
 * React Query hooks for authentication.
 *
 * Hook overview
 * -------------
 * useCurrentUser  — query  — fetches the logged-in user's profile (/auth/me).
 *                            Only runs when an access token is present.
 * useLogin        — mutation — POST /auth/login; stores the token and seeds the
 *                              cache so a subsequent useCurrentUser call is free.
 * useRegister     — mutation — POST /auth/register; callers should redirect to
 *                              /login on success.
 * useLogout       — mutation — POST /auth/logout; clears the token and wipes the
 *                              entire query cache on settled (success or error)
 *                              so no stale data remains.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken, setAccessToken } from './authToken';
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
  type LoginRequest,
  type RegisterRequest,
} from './api';
import { authKeys } from './queryKeys';

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user's profile.
 *
 * The query is disabled when there is no access token in localStorage,
 * so it will not fire on the public login / register pages.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUserApi,
    enabled: !!getAccessToken(),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Log in with email + password.
 *
 * On success:
 *  1. Stores the returned access token in memory.
 *  2. Pre-populates the currentUser cache so `/auth/me` doesn't need to
 *     be fetched separately after login.
 *
 * Usage:
 *   const { mutate: login, isPending, error } = useLogin();
 *   login({ email, password }, { onSuccess: () => navigate('/dashboard') });
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginApi(credentials),
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      queryClient.setQueryData(authKeys.currentUser(), data.user);
    },
  });
}

/**
 * Register a new account.
 *
 * The mutation does not touch the query cache or the access token — callers
 * should redirect to /login and let the user authenticate normally.
 *
 * Usage:
 *   const { mutate: register, isPending, error } = useRegister();
 *   register({ email, password }, { onSuccess: () => navigate('/login') });
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
  });
}

/**
 * Log out the current user.
 *
 * Uses `onSettled` (runs on both success and error) so the local session is
 * always cleared even when the server call fails — e.g. if the access token
 * has already expired.
 *
 * Usage:
 *   const { mutate: logout } = useLogout();
 *   logout(undefined, { onSettled: () => navigate('/login') });
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
    },
  });
}
