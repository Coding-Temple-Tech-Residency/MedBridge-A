from fastapi import HTTPException

SUPPORTED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "text/plain",
}

def validate_not_empty(file_bytes):
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

def validate_mime_type(mime_type):
    if mime_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {mime_type}. Supported: PDF, PNG, JPEG, plain text.",
        )

def validate_magic_bytes(file_bytes, mime_type):
    if mime_type == "application/pdf" and not file_bytes.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file.")
    if mime_type == "image/png" and not file_bytes.startswith(b"\x89PNG"):
        raise HTTPException(status_code=400, detail="Invalid PNG file.")
    if mime_type == "image/jpeg" and not file_bytes.startswith(b"\xFF\xD8"):
        raise HTTPException(status_code=400, detail="Invalid JPEG file.")

def validate_file_size(file_bytes, max_mb=25):
    if len(file_bytes) > max_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds max size of {max_mb}MB.")
