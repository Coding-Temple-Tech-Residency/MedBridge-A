"""Text chunker for long medical documents.

Large documents can exceed Groq's context window. This utility splits
extracted text into overlapping segments so no information is lost at chunk
boundaries. Used by both the summarizer (map-reduce path) and the Q&A engine.

Pure Python — no external dependencies (stdlib only, and in fact no imports).
"""


def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200) -> list[str]:
    """Split text into overlapping, word-boundary-aligned chunks.

    Args:
        text: the full text to split.
        chunk_size: target maximum characters per chunk.
        overlap: number of characters each chunk overlaps the previous one.

    Returns:
        A list of chunk strings. Empty input returns an empty list.
        Text shorter than chunk_size returns a single-element list.

    Guarantees:
        - No chunk is an empty string.
        - Chunks split on word boundaries (never mid-word) when possible.
        - Consecutive chunks overlap by `overlap` characters.
    """
    # Criterion #24: empty input returns []
    if not text:
        return []

    # Criterion #20: text shorter than chunk_size returns a single element
    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size

        # If this isn't the last chunk, back up to a word boundary so we
        # never cut mid-word (criterion #21).
        if end < text_len:
            # find the last space at or before `end` within this window
            boundary = text.rfind(" ", start, end)
            # only use the boundary if it's past the start (avoids a zero-width
            # or backwards chunk when a single "word" is longer than chunk_size)
            if boundary > start:
                end = boundary

        chunk = text[start:end].strip()

        # Criterion #23: never append an empty string
        if chunk:
            chunks.append(chunk)

        # If we've reached the end, stop.
        if end >= text_len:
            break

        # Criterion #22: next chunk starts ~`overlap` characters back from the
        # end of this one, so consecutive chunks overlap.
        next_start = end - overlap

        # Criterion #21 (overlap side): the overlap start can land mid-word,
        # which would slice a word at the front of the next chunk. Align it
        # forward to the next word boundary so chunks start on a full word.
        if 0 < next_start < text_len:
            space = text.find(" ", next_start)
            if space != -1 and space < end:
                next_start = space + 1  # start just after the space

        # Safety: always make forward progress (avoids infinite loops if
        # overlap >= chunk_size or on pathological input).
        if next_start <= start:
            next_start = end

        start = next_start

    return chunks
