"""Document text extraction for uploaded medical documents (AI-205).

Supports PDF (text-layer extraction), PNG (OCR via tesseract), and plain
text (.txt). Used by the documents upload route as the first stage of the
AI ingestion pipeline — everything downstream (summarization, Q&A,
metrics) reads from the text this produces.
"""
from __future__ import annotations

import io

import fitz  # pymupdf
import pytesseract
from PIL import Image

# Maps both the multipart-reported content_type AND common filename
# extensions to a canonical file_type string. Browsers are inconsistent
# about content_type for .txt (sometimes empty or application/octet-stream),
# so the filename extension is used as a fallback.
_MIME_TO_TYPE = {
    "application/pdf": "pdf",
    "image/png": "png",
    "text/plain": "txt",
}
_EXT_TO_TYPE = {
    "pdf": "pdf",
    "png": "png",
    "txt": "txt",
}


class UnsupportedFileTypeError(Exception):
    """Raised when a file's type can't be resolved to a supported parser.

    The router catches this and returns 415.
    """

    def __init__(self, content_type: str | None, filename: str = ""):
        self.content_type = content_type
        self.filename = filename
        super().__init__(
            f"Unsupported file type: {content_type!r} (filename={filename!r})"
        )


def resolve_file_type(content_type: str | None, filename: str) -> str:
    """Resolve a MIME type / filename pair to a canonical file_type.

    Tries content_type first, falls back to the filename extension.
    Raises UnsupportedFileTypeError if neither resolves to pdf/png/txt.
    """
    if content_type in _MIME_TO_TYPE:
        return _MIME_TO_TYPE[content_type]

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in _EXT_TO_TYPE:
        return _EXT_TO_TYPE[ext]

    raise UnsupportedFileTypeError(content_type, filename)


def parse_document(
    file_bytes: bytes, content_type: str | None, filename: str
) -> tuple[str, str]:
    """Extract plain text from raw uploaded file bytes.

    Args:
        file_bytes: raw uploaded file content.
        content_type: MIME type reported by the multipart upload.
        filename: original filename (used as a type-resolution fallback).

    Returns:
        (extracted_text, file_type) — text is stripped and may be empty if
        nothing could be read; the caller applies the <20-char acceptance
        check (criterion #32) since that's a route-level policy, not a
        parsing concern.

    Raises:
        UnsupportedFileTypeError: if the file type isn't pdf/png/txt.
    """
    file_type = resolve_file_type(content_type, filename)

    if file_type == "pdf":
        text = _parse_pdf(file_bytes)
    elif file_type == "png":
        text = _parse_png(file_bytes)
    else:
        text = _parse_txt(file_bytes)

    return text.strip(), file_type


def _parse_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


def _parse_png(file_bytes: bytes) -> str:
    image = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(image)


def _parse_txt(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("utf-8", errors="ignore")
