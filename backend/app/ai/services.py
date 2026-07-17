from app.services.groq_client import ask_groq  # your existing AI client


def run_qa_engine(document_text: str, question: str, history: list[dict]):
    """
    Wraps your AI engine so the router stays clean.
    """

    # Format history for the model
    messages = [
        {"role": h["role"], "content": h["content"]}
        for h in history
    ]

    messages.append({"role": "user", "content": question})

    # Call your Groq client
    response = ask_groq(
        system_prompt="You are a medical Q&A assistant.",
        document_text=document_text,
        messages=messages,
    )

    return response
from app.services.groq_client import ask_groq


def run_qa_engine_single(document_text: str, question: str):
    """
    Single-turn Q&A for AI-208.
    No conversation history.
    """

    messages = [
        {"role": "system", "content": "You are a medical Q&A assistant."},
        {"role": "user", "content": f"Document:\n{document_text}"},
        {"role": "user", "content": f"Question:\n{question}"},
    ]

    response = ask_groq(messages=messages)
    return response
