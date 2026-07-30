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
    public readonly data?: unknown,
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

function getDetailFromData(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const candidate = data as { detail?: unknown; message?: unknown; error?: unknown };
  if (typeof candidate.detail === 'string') return candidate.detail;
  if (typeof candidate.message === 'string') return candidate.message;
  if (typeof candidate.error === 'string') return candidate.error;

  return undefined;
}

export function toApiError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.'): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const response =
    typeof error === 'object' && error !== null
      ? (error as { response?: { status?: number; data?: unknown } }).response
      : undefined;

  const status = typeof response?.status === 'number' ? response.status : 500;
  const detail = getDetailFromData(response?.data) ?? fallbackMessage;

  return new ApiError(status, detail, response?.data);
}

export function messageForStatus(
  status: number,
  mapping: Partial<Record<number, string>>,
  fallback: string,
): string {
  return mapping[status] ?? fallback;
}
