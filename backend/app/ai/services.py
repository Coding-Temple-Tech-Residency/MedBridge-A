"""Q&A service layer for the AI routes.

These are thin wrappers over app.services.qa_engine.answer_question(), which
owns the actual Groq call. Everything safety-critical lives there:

  - the approved system prompt (implementation plan §5.2) — explanation only,
    never diagnosis, answers grounded in the document, care sign-off on health
    questions, and the off-topic redirect
  - the 6,000-character context guard
  - the Q&A Groq parameters (temperature 0.4, max_tokens 512)

Per plan §1.3 the safety boundary is enforced at the prompt-engineering level,
so every path to the model must go through the engine. Don't call Groq directly
from here.
"""

from app.services.qa_engine import answer_question


def run_qa_engine(document_text: str, question: str, history: list[dict]) -> str:
    """Multi-turn Q&A — the patient's prior conversation comes along."""
    return answer_question(
        question=question,
        document_context=document_text,
        conversation_history=history,
    )


def run_qa_engine_single(document_text: str, question: str) -> str:
    """Single-turn Q&A — same engine, no prior conversation."""
    return answer_question(
        question=question,
        document_context=document_text,
        conversation_history=[],
    )
