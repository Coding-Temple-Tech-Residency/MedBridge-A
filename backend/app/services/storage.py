"""Supabase Storage integration for the document upload pipeline (AI-205).

Wraps Supabase Storage so the rest of the app doesn't depend on the client
directly. Called by app.documents.services.DocumentService.upload as:

    upload_file(bucket, storage_path, content, content_type)

Credentials come from the environment (SUPABASE_URL, SUPABASE_KEY). The client
is built lazily on first use, not at import time — so importing this module
never requires credentials (the app and CI import cleanly), and a missing-config
error only surfaces when an upload is actually attempted.
"""

import os


class StorageUploadError(Exception):
    """Raised when a file cannot be stored (missing config, or upload failure)."""


_client = None


def _get_client():
    """Return a cached Supabase client, creating it on first call."""
    global _client
    if _client is not None:
        return _client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise StorageUploadError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY."
        )

    try:
        from supabase import create_client
    except ImportError as exc:
        raise StorageUploadError("The 'supabase' package is not installed.") from exc

    _client = create_client(url, key)
    return _client


def upload_file(bucket: str, path: str, content: bytes, content_type: str) -> str:
    """Upload raw bytes to a Supabase Storage bucket. Returns the storage path.

    Raises StorageUploadError if credentials are missing or the upload fails.
    """
    client = _get_client()
    try:
        client.storage.from_(bucket).upload(
            path=path,
            file=content,
            file_options={"content-type": content_type},
        )
    except Exception as exc:
        raise StorageUploadError(f"Supabase upload failed: {exc}") from exc
    return path
