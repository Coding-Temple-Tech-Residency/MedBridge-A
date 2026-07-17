"""Conversational Q&A engine (AI-209).

Answers a patient's questions about their own uploaded medical document, using
the approved system prompt from the AI Feature Implementation Plan §5.2.

The engine is stateless: the caller supplies the document context and the full
prior conversation, and gets back one answer. Persistence (sessions, message
history) is AI-210's job.

Safety boundary: the system prompt scopes the model to explanation only — never
diagnosis, prescription, or treatment recommendations — and requires the care
sign-off on any answer touching health concerns. Per plan §1.3 this is enforced
at the prompt-engineering level, not left to the UI.
"""

import logging

from app.services.groq_client import groq_client

logger = logging.getLogger(__name__)

# --- Groq call configuration (criterion #57, plan §5.1) ---
MODEL = "llama-3.3-70b-versatile"
TEMPERATURE = 0.4
MAX_TOKENS = 512

# --- Context window guard (criterion #56, plan §5.3 step 5) ---
MAX_CONTEXT_CHARS = 6000
TRUNCATION_NOTE = "[Document truncated for processing]"

# --- Required response elements ---
# Criterion #58 — enforced via the system prompt, not post-processing.
CARE_SIGNOFF = (
    "Remember, your doctor is the best person to answer specific questions "
    "about your care."
)

# Criterion #59 — the polite redirect for off-topic questions.
OFF_TOPIC_REDIRECT = (
    "I'm here to help you understand your medical documents. Could you ask me "
    "something about your health records?"
)

# --- The approved system prompt (plan §5.2) ---
# {document_context} is substituted at runtime. The final paragraph implements
# criterion #59, which the §5.2 template does not itself cover.
SYSTEM_PROMPT_TEMPLATE = (
    "You are MedBridge, a helpful health literacy assistant. A patient has "
    "uploaded a medical document and wants to understand it better. You have "
    "access to the content of their document below. Answer their questions in "
    "simple, clear language. Be warm, patient, and never condescending. Only "
    "answer questions based on the document provided — if the answer isn't in "
    "the document, say so honestly. Never diagnose, prescribe, or give "
    "treatment recommendations.\n\n"
    "Document Content: {document_context}\n\n"
    f'Always end answers that touch on health concerns with: "{CARE_SIGNOFF}"\n\n'
    "If the question is clearly off-topic — unrelated to health or to this "
    f'document — respond only with: "{OFF_TOPIC_REDIRECT}"'
)


def _truncate_context(document_context: str) -> str:
    """Cap the document context at MAX_CONTEXT_CHARS (criterion #56)."""
    document_context = document_context or ""

    if len(document_context) <= MAX_CONTEXT_CHARS:
        return document_context

    logger.warning(
        "Document context truncated for Q&A: %d chars -> %d",
        len(document_context),
        MAX_CONTEXT_CHARS,
    )
    return f"{document_context[:MAX_CONTEXT_CHARS]}\n\n{TRUNCATION_NOTE}"


def _build_system_prompt(document_context: str) -> str:
    # .replace rather than .format: document text may contain braces, and we
    # never want it interpreted as a format spec.
    return SYSTEM_PROMPT_TEMPLATE.replace(
        "{document_context}", _truncate_context(document_context)
    )


def build_messages(
    question: str,
    document_context: str,
    conversation_history: list[dict] | None,
) -> list[dict]:
    """Assemble the Groq messages array (criterion #55).

    Order is exactly: [system_message] + conversation_history + [user_message].
    """
    return [
        {"role": "system", "content": _build_system_prompt(document_context)},
        *(conversation_history or []),
        {"role": "user", "content": question},
    ]


def answer_question(
    question: str,
    document_context: str,
    conversation_history: list[dict] | None = None,
) -> str:
    """Answer a patient's question about their document.

    Raises:
        RuntimeError: if the Groq API fails.
    """
    messages = build_messages(question, document_context, conversation_history)

    try:
        response = groq_client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        raise RuntimeError("AI chat failed. Please try again.") from exc
