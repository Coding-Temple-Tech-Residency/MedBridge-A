"""Summarization engine (AI-207).

Turns extracted medical document text into a plain-language summary via Groq
(Llama 3.3 70B), using the approved system prompt from the AI Feature
Implementation Plan §4.2.

Two paths:
  - Documents <= 1,500 characters: a single Groq call with the full text.
  - Documents  > 1,500 characters: map-reduce — summarize each chunk from
    chunk_text(), then a final consolidation call over those summaries.

The medical disclaimer is non-negotiable. It is baked into the system prompt
AND enforced programmatically here — the model is never trusted to remember it
(plan §4.2, "Disclaimer Enforcement").
"""

from app.services.chunker import chunk_text
from app.services.groq_client import groq_client

# --- Groq call configuration (criterion #43, plan §4.1) ---
MODEL = "llama-3.3-70b-versatile"
TEMPERATURE = 0.3
MAX_TOKENS = 1024

# Documents at or below this length get a single-pass summary (criterion #41).
SINGLE_PASS_CHAR_LIMIT = 1500

# --- The disclaimer (criterion #44) ---
# Every summary must end with exactly this string. Defined once here so the
# service and its tests share a single source of truth.
DISCLAIMER = (
    "⚠️ This summary is for informational purposes only and is not a "
    "substitute for professional medical advice. Please consult your "
    "healthcare provider with any questions about your health."
)

# --- The approved system prompt (plan §4.2 — do not modify) ---
SYSTEM_PROMPT = (
    "You are a medical document assistant helping patients understand their "
    "own health records. Your job is to explain medical documents in simple, "
    "clear language that anyone can understand — avoid jargon, spell out "
    "acronyms, and be reassuring but accurate.\n\n"
    "Structure your summary as:\n"
    "1. What this document is\n"
    "2. Key findings (in plain English)\n"
    "3. What to pay attention to or follow up on\n\n"
    "IMPORTANT: You are NOT a doctor and this is NOT medical advice. Always "
    f'end your response with: "{DISCLAIMER}"'
)

# Lightweight system prompt for the map step. Chunk summaries are intermediate
# — they are fed into the consolidation call, never surfaced to a user — so
# they deliberately skip the disclaimer instruction to avoid one disclaimer
# per chunk polluting the consolidation input.
CHUNK_SYSTEM_PROMPT = (
    "You are a medical document assistant. Summarize sections of medical "
    "documents in simple, clear language. Avoid jargon and spell out acronyms."
)

CHUNK_USER_PREFIX = "Summarize this section of a medical document in 3-5 sentences:"

# Criterion #42 — the consolidation ("reduce") instruction.
CONSOLIDATION_PREFIX = (
    "Here are summaries of sections of a medical document. Write a unified "
    "plain-language summary."
)

SINGLE_PASS_USER_PREFIX = "Please summarize the following medical document:"


def _call_groq(system_prompt: str, user_content: str) -> str:
    """Send one chat completion to Groq and return the response text.

    Raises:
        RuntimeError: on any Groq failure (criterion #45). The original error
            is chained for server-side logging but not surfaced to the user.
    """
    try:
        response = groq_client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        raise RuntimeError("AI summarization failed. Please try again.") from exc


def _ensure_disclaimer(summary: str) -> str:
    """Guarantee the summary ends with the exact disclaimer (criterion #44).

    The system prompt asks the model to append it, but models forget. This is
    the programmatic backstop required by plan §4.2 — no summary reaches a user
    without it.
    """
    summary = (summary or "").strip()

    if summary.endswith(DISCLAIMER):
        return summary

    if not summary:
        return DISCLAIMER

    return f"{summary}\n\n{DISCLAIMER}"


def _summarize_single_pass(raw_text: str) -> str:
    return _call_groq(
        SYSTEM_PROMPT,
        f"{SINGLE_PASS_USER_PREFIX}\n\n{raw_text}",
    )


def _summarize_map_reduce(raw_text: str) -> str:
    # Map: one call per chunk.
    chunk_summaries = [
        _call_groq(CHUNK_SYSTEM_PROMPT, f"{CHUNK_USER_PREFIX}\n\n{chunk}")
        for chunk in chunk_text(raw_text)
    ]

    # Reduce: one consolidation call over the chunk summaries.
    joined = "\n\n".join(s.strip() for s in chunk_summaries if s and s.strip())
    return _call_groq(
        SYSTEM_PROMPT,
        f"{CONSOLIDATION_PREFIX}\n\n{joined}",
    )


def summarize_document(raw_text: str) -> str:
    """Summarize a medical document in plain language.

    Args:
        raw_text: the extracted document text.

    Returns:
        A plain-language summary, always ending with the medical disclaimer.

    Raises:
        RuntimeError: if the Groq API fails.
    """
    raw_text = raw_text or ""

    if len(raw_text) <= SINGLE_PASS_CHAR_LIMIT:
        summary = _summarize_single_pass(raw_text)
    else:
        summary = _summarize_map_reduce(raw_text)

    return _ensure_disclaimer(summary)
