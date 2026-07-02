// In-memory access token store.
//
// The access token is held in module memory only — it is intentionally lost on
// a full page refresh or tab close. Silent re-authentication is handled via the
// refresh token, which the backend sets as an HttpOnly, Secure, SameSite cookie
// (so it is never readable from JS). For that cookie to ride along with API
// requests, the apiClient must be configured with `withCredentials: true`.
//
// NOTE: This storage strategy is pending final confirmation at the FE-08 API
// contract sync. If the team lands on a different approach, this file is the
// only place that should need to change.

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;
