"""Document text extraction for the upload pipeline (AI-205).

Extracts raw text from the three supported upload types:
  - PDF  -> PyMuPDF (fitz)
  - PNG  -> OCR via pytesseract (requires the tesseract binary installed)
  - TXT  -> direct UTF-8 decode

Called by app.documents.services.DocumentService.upload as:
    text, file_type = parse_document(content, content_type, filename)
"""

import io


class UnsupportedFileTypeError(Exception):
    """Raised when a file's type is not one of PDF, PNG, or TXT."""

    def __init__(self, content_type: str | None):
        self.content_type = content_type
        super().__init__(f"Unsupported file type: {content_type or 'unknown'}")


_PDF_TYPES = {"application/pdf"}
_PNG_TYPES = {"image/png"}
_TXT_TYPES = {"text/plain"}


def _classify(content_type: str | None, filename: str | None) -> str:
    ct = (content_type or "").lower().split(";")[0].strip()
    if ct in _PDF_TYPES:
        return "pdf"
    if ct in _PNG_TYPES:
        return "png"
    if ct in _TXT_TYPES:
        return "txt"

    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return "pdf"
    if name.endswith(".png"):
        return "png"
    if name.endswith(".txt"):
        return "txt"

    raise UnsupportedFileTypeError(content_type)


def _extract_pdf(content: bytes) -> str:
    import fitz

    parts = []
    with fitz.open(stream=content, filetype="pdf") as doc:
        for page in doc:
            parts.append(page.get_text())
    return "\n".join(parts).strip()


def _extract_png(content: bytes) -> str:
    import pytesseract
    from PIL import Image

    image = Image.open(io.BytesIO(content))
    return pytesseract.image_to_string(image).strip()


def _extract_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="replace").strip()


def parse_document(
    content: bytes,
    content_type: str | None,
    filename: str | None = None,
) -> tuple[str, str]:
    """Extract text from an uploaded file. Returns (text, file_type)."""
    file_type = _classify(content_type, filename)

    if file_type == "pdf":
        text = _extract_pdf(content)
    elif file_type == "png":
        text = _extract_png(content)
    else:
        text = _extract_txt(content)

    return text, file_type
