import os
from fastapi import HTTPException
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "medical-docs"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class StorageService:

    @staticmethod
    def upload(user_id: int, file_name: str, file_bytes: bytes, mime: str) -> str:
        """
        Uploads a file to Supabase Storage and returns the storage path.
        """

        storage_path = f"{user_id}/{file_name}"

        try:
            supabase.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": mime},
                upsert=True,
            )
        except Exception as e:
            raise HTTPException(500, f"Storage upload failed: {e}")

        return storage_path

    @staticmethod
    def signed_url(storage_path: str, expires_in: int = 3600) -> str:
        """
        Generates a signed URL for downloading a file.
        """

        try:
            url = supabase.storage.from_(BUCKET_NAME).create_signed_url(
                storage_path,
                expires_in=expires_in,
            )
        except Exception as e:
            raise HTTPException(500, f"Failed to generate download URL: {e}")

        if not url:
            raise HTTPException(500, "Supabase returned an empty signed URL.")

        return url
