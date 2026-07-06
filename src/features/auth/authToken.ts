// In-memory access token store.
//
// The access token is held in module memory only — it is intentionally lost on
// a full page refresh or tab close. Silent re-authentication is handled via the
// refresh token, which the backend sets as an HttpOnly, Secure, SameSite cookie
// (so it is never readable from JS). For that cookie to ride along with API
// requests, the apiClient must be configured with `withCredentials: true`.
//
// Callbacks allow non-React code (e.g. the API client) to notify the React
// auth context when the token changes or when a forced logout is required.

let accessToken: string | null = null;

let _onTokenChange: ((token: string | null) => void) | null = null;
let _onForceLogout: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  _onTokenChange?.(token);
};

export const getAccessToken = () => accessToken;

/** Called by AuthContext to receive reactive token updates. */
export const registerTokenChangeCallback = (cb: (token: string | null) => void) => {
  _onTokenChange = cb;
};

/** Called by AuthContext to handle forced logout (e.g. refresh token expired). */
export const registerForceLogoutCallback = (cb: () => void) => {
  _onForceLogout = cb;
};

/** Triggered by the API client when a token refresh fails. */
export const triggerForceLogout = () => {
  _onForceLogout?.();
};
