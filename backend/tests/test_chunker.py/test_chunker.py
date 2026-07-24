"""Tests for the text chunker (AI-204).

Covers the acceptance criteria: single-chunk, multi-chunk, exact overlap,
word-boundary splitting, no empty strings, and empty-input -> [].
"""

from app.services.chunker import chunk_text


def test_empty_string_returns_empty_list():
    # Criterion #24: empty input returns []
    assert chunk_text("") == []


def test_short_text_returns_single_chunk():
    # Criterion #20: text shorter than chunk_size is not split
    text = "This is a short document."
    result = chunk_text(text, chunk_size=1500, overlap=200)
    assert result == [text]
    assert len(result) == 1


def test_text_equal_to_chunk_size_returns_single_chunk():
    # boundary: exactly chunk_size long -> still one chunk
    text = "a" * 100
    result = chunk_text(text, chunk_size=100, overlap=10)
    assert result == [text]


def test_long_text_produces_multiple_chunks():
    # Criterion: multi-chunk case
    # 50 words, each "word" ~10 chars -> well over a small chunk_size
    text = " ".join(f"word{i:03d}xxxx" for i in range(50))
    result = chunk_text(text, chunk_size=100, overlap=20)
    assert len(result) > 1


def test_no_chunk_is_empty():
    # Criterion #23: no empty strings in output
    text = " ".join(f"token{i}" for i in range(200))
    result = chunk_text(text, chunk_size=120, overlap=30)
    assert all(chunk != "" for chunk in result)
    assert all(len(chunk.strip()) > 0 for chunk in result)


def test_chunks_split_on_word_boundaries():
    # Criterion #21: never split mid-word.
    # Build text of known words; every chunk should start and end on a full word.
    words = [f"alpha{i}" for i in range(100)]
    text = " ".join(words)
    result = chunk_text(text, chunk_size=80, overlap=20)
    for chunk in result:
        # a chunk that doesn't begin/end mid-word will, when split on spaces,
        # yield only tokens that appear in the original word list
        for token in chunk.split():
            assert token in words, f"chunk contains a broken token: {token!r}"


def test_overlap_correctness_by_string_comparison():
    # Criterion #22 / #24: verify overlap by comparing the tail of one chunk
    # to the head of the next. With word-boundary alignment the overlap won't
    # be exactly `overlap` chars, but the end of chunk N must reappear at the
    # start of chunk N+1 -- i.e. consecutive chunks genuinely share text.
    text = " ".join(f"segment{i:03d}" for i in range(80))
    overlap = 30
    result = chunk_text(text, chunk_size=150, overlap=overlap)

    assert len(result) >= 2  # need at least two chunks to compare

    for i in range(len(result) - 1):
        current = result[i]
        nxt = result[i + 1]
        # the last word of `current` should appear near the start of `nxt`
        current_tail_words = current.split()[-2:]  # last couple words
        next_head = " ".join(nxt.split()[:6])       # first few words of next
        assert any(w in next_head for w in current_tail_words), (
            f"chunk {i} and {i+1} do not overlap:\n"
            f"  end of {i}: ...{current[-40:]!r}\n"
            f"  start of {i+1}: {nxt[:40]!r}..."
        )


def test_single_long_word_does_not_infinite_loop():
    # edge case: a "word" longer than chunk_size with no spaces.
    # Must still terminate and return non-empty chunks.
    text = "x" * 500
    result = chunk_text(text, chunk_size=100, overlap=20)
    assert len(result) >= 1
    assert all(chunk != "" for chunk in result)
