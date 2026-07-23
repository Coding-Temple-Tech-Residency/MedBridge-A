"""Supabase Storage upload helper (AI-205).

Talks to Supabase Storage over its REST API directly via httpx rather than
pulling in the full `supabase` client library — httpx is already a
dependency and the storage API is a single call, so this keeps the
dependency footprint the same as the rest of the app.
"""
from __future__ import annotations

import httpx

from app.config import settings

_UPLOAD_TIMEOUT_SECONDS = 30.0


class StorageUploadError(Exception):
    """Raised when the Supabase Storage upload request fails."""

    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Storage upload failed ({status_code}): {detail}")


def upload_file(bucket: str, path: str, content: bytes, content_type: str) -> str:
    """Upload raw bytes to a Supabase Storage bucket.

    Args:
        bucket: bucket name, e.g. "documents".
        path: object path within the bucket, e.g. "{user_id}/{uuid4()}/{filename}".
        content: raw file bytes.
        content_type: MIME type to store the object with.

    Returns:
        The storage_path that was written (same as `path`, returned for
        convenience so callers can persist it directly).

    Raises:
        StorageUploadError: on any non-2xx response from Supabase.
    """
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise StorageUploadError(
            0, "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in .env."
        )

    url = f"{settings.supabase_url}/storage/v1/object/{bucket}/{path}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": content_type,
        # Supabase errors if an object already exists at this path unless
        # upsert is set — paths are uuid4-namespaced so collisions aren't
        # expected, but this keeps retries safe.
        "x-upsert": "true",
    }

    with httpx.Client(timeout=_UPLOAD_TIMEOUT_SECONDS) as client:
        response = client.post(url, headers=headers, content=content)

    if response.status_code not in (200, 201):
        raise StorageUploadError(response.status_code, response.text)

    return path
