# app/services/text_conversion.py

class TextConversionService:
    """
    Converts raw text input into a pseudo-file so the upload pipeline
    can treat it exactly like a normal file upload.
    """

    @staticmethod
    def convert(raw_text: str):
        # Convert raw text into bytes
        file_bytes = raw_text.encode("utf-8")

        # Create a fake filename
        file_name = "raw_text_upload.txt"

        # MIME type for plain text
        mime = "text/plain"

        return file_bytes, file_name, mime
