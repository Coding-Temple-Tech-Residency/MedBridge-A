/**
 * Represents an error returned from the API.
 *
 * Carries the HTTP status code alongside the human-readable `detail` message
 * that every error body from the backend includes:
 *   { "detail": "A human-readable message" }
 *
 * Callers can branch on `error.status` to handle specific codes (e.g. 401, 409)
 * without inspecting raw response objects.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}
