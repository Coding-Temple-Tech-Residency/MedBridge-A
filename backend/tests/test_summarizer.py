"""Tests for the summarization engine (AI-207).

The Groq client is mocked throughout — these are unit tests and must never
make a live API call (they run in CI with a dummy key).
"""

import pytest

from app.services import summarizer
from app.services.summarizer import DISCLAIMER, summarize_document


class _FakeMessage:
    def __init__(self, content):
        self.content = content


class _FakeChoice:
    def __init__(self, content):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    """Records every create() call and returns canned responses."""

    def __init__(self, responses=None, raises=None):
        self.calls = []
        self._responses = responses
        self._raises = raises

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self._raises is not None:
            raise self._raises
        if isinstance(self._responses, list):
            idx = min(len(self.calls) - 1, len(self._responses) - 1)
            return _FakeResponse(self._responses[idx])
        return _FakeResponse(self._responses)


class _FakeChat:
    def __init__(self, completions):
        self.completions = completions


class _FakeGroqClient:
    def __init__(self, responses=None, raises=None):
        self.completions = _FakeCompletions(responses=responses, raises=raises)
        self.chat = _FakeChat(self.completions)

    @property
    def calls(self):
        return self.completions.calls


def _install(monkeypatch, client):
    monkeypatch.setattr(summarizer, "groq_client", client)
    return client


# -- Single-pass path (criterion #41) ----------------------------------------


def test_short_document_uses_single_groq_call(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(responses="A short summary."))

    summarize_document("Short document text.")

    assert len(client.calls) == 1, "short docs must be one Groq call, not map-reduce"


def test_document_at_threshold_is_still_single_pass(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(responses="Summary."))

    summarize_document("x" * 1500)

    assert len(client.calls) == 1


# -- Map-reduce path (criterion #42) -----------------------------------------


def test_long_document_triggers_map_reduce(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(responses="Section summary."))

    long_text = " ".join(f"word{i:04d}" for i in range(600))
    assert len(long_text) > 1500

    summarize_document(long_text)

    assert len(client.calls) > 2, "long docs must map-reduce, not single-pass"


def test_map_reduce_final_call_is_consolidation(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(responses="Section summary."))

    long_text = " ".join(f"word{i:04d}" for i in range(600))
    summarize_document(long_text)

    final_call = client.calls[-1]
    user_message = final_call["messages"][-1]["content"]
    assert "Here are summaries of sections of a medical document" in user_message


# -- Disclaimer enforcement (criterion #44) ----------------------------------


def test_disclaimer_appended_when_model_omits_it(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(responses="Summary with no disclaimer."))

    summary = summarize_document("Short text.")

    assert summary.endswith(DISCLAIMER)


def test_disclaimer_not_duplicated_when_model_includes_it(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(responses=f"Summary text.\n\n{DISCLAIMER}"))

    summary = summarize_document("Short text.")

    assert summary.endswith(DISCLAIMER)
    assert summary.count(DISCLAIMER) == 1, "disclaimer must not be doubled"


def test_disclaimer_present_on_map_reduce_path(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(responses="Consolidated summary."))

    long_text = " ".join(f"word{i:04d}" for i in range(600))
    summary = summarize_document(long_text)

    assert summary.endswith(DISCLAIMER)


def test_disclaimer_present_even_for_empty_model_response(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(responses=""))

    summary = summarize_document("Short text.")

    assert summary.endswith(DISCLAIMER)


# -- Groq call parameters (criterion #43) ------------------------------------


def test_groq_called_with_required_parameters(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(responses="Summary."))

    summarize_document("Short text.")

    call = client.calls[0]
    assert call["model"] == "llama-3.3-70b-versatile"
    assert call["temperature"] == 0.3
    assert call["max_tokens"] == 1024


def test_system_prompt_is_sent_first(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(responses="Summary."))

    summarize_document("Short text.")

    messages = client.calls[0]["messages"]
    assert messages[0]["role"] == "system"
    assert messages[1]["role"] == "user"
    assert "medical document assistant" in messages[0]["content"]


# -- Error handling (criterion #45) ------------------------------------------


def test_groq_failure_raises_runtime_error(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(raises=Exception("groq exploded")))

    with pytest.raises(RuntimeError, match="AI summarization failed. Please try again."):
        summarize_document("Short text.")
