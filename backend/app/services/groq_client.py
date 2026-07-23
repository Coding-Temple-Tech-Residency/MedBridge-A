"""Centralized Groq API client singleton.

All AI services (summarizer, qa_engine, metrics_extractor) must import
`groq_client` from this module rather than constructing their own Groq
client instance, so API key handling and client configuration live in
exactly one place.
"""

import os
from typing import Any

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

if "GROQ_API_KEY" not in os.environ:
    raise EnvironmentError("GROQ_API_KEY is not set. Add it to your .env file.")

groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])


def ask_groq(
    *,
    messages: list[dict[str, Any]],
    system_prompt: str | None = None,
    document_text: str | None = None,
    model: str = "llama-3.3-70b-versatile",
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> str:
    chat_messages: list[dict[str, Any]] = []

    if system_prompt:
        chat_messages.append({"role": "system", "content": system_prompt})

    if document_text:
        chat_messages.append({"role": "user", "content": f"Document:\n{document_text}"})

    chat_messages.extend(messages)

    response = groq_client.chat.completions.create(
        model=model,
        messages=chat_messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content or ""
