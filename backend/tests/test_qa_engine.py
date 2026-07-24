"""Tests for the conversational Q&A engine (AI-209).

The Groq client is mocked throughout — no live API calls.
"""

import pytest

from app.services import qa_engine
from app.services.qa_engine import (
    CARE_SIGNOFF,
    MAX_CONTEXT_CHARS,
    OFF_TOPIC_REDIRECT,
    TRUNCATION_NOTE,
    answer_question,
    build_messages,
)


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
    def __init__(self, response="An answer.", raises=None):
        self.calls = []
        self._response = response
        self._raises = raises

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self._raises is not None:
            raise self._raises
        return _FakeResponse(self._response)


class _FakeChat:
    def __init__(self, completions):
        self.completions = completions


class _FakeGroqClient:
    def __init__(self, response="An answer.", raises=None):
        self.completions = _FakeCompletions(response=response, raises=raises)
        self.chat = _FakeChat(self.completions)

    @property
    def calls(self):
        return self.completions.calls


def _install(monkeypatch, client):
    monkeypatch.setattr(qa_engine, "groq_client", client)
    return client


# -- Messages array construction (criteria #54, #55) -------------------------


def test_messages_array_order_is_system_history_question():
    history = [
        {"role": "user", "content": "First question?"},
        {"role": "assistant", "content": "First answer."},
    ]

    messages = build_messages("Second question?", "Doc text.", history)

    assert messages[0]["role"] == "system"
    assert messages[1] == {"role": "user", "content": "First question?"}
    assert messages[2] == {"role": "assistant", "content": "First answer."}
    assert messages[3] == {"role": "user", "content": "Second question?"}
    assert len(messages) == 4


def test_empty_history_produces_system_plus_question_only():
    messages = build_messages("Only question?", "Doc text.", [])

    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert messages[1] == {"role": "user", "content": "Only question?"}


def test_none_history_is_treated_as_empty():
    messages = build_messages("Only question?", "Doc text.", None)

    assert len(messages) == 2
    assert messages[1] == {"role": "user", "content": "Only question?"}


def test_history_is_not_mutated():
    history = [{"role": "user", "content": "Q1"}]

    build_messages("Q2", "Doc text.", history)

    assert history == [{"role": "user", "content": "Q1"}], "history must not be mutated"


def test_document_context_is_embedded_in_system_prompt():
    messages = build_messages("Q?", "UNIQUE_DOCUMENT_MARKER", [])

    assert "UNIQUE_DOCUMENT_MARKER" in messages[0]["content"]


# -- Context truncation (criterion #56) --------------------------------------


def test_context_at_exactly_limit_is_not_truncated():
    context = "x" * MAX_CONTEXT_CHARS

    messages = build_messages("Q?", context, [])

    assert TRUNCATION_NOTE not in messages[0]["content"]


def test_context_over_limit_is_truncated_with_note():
    context = "x" * (MAX_CONTEXT_CHARS + 1)

    messages = build_messages("Q?", context, [])
    system = messages[0]["content"]

    assert TRUNCATION_NOTE in system
    assert "x" * (MAX_CONTEXT_CHARS + 1) not in system


def test_truncation_keeps_the_first_6000_characters():
    context = ("a" * MAX_CONTEXT_CHARS) + ("b" * 500)

    messages = build_messages("Q?", context, [])
    system = messages[0]["content"]

    assert "a" * MAX_CONTEXT_CHARS in system
    assert "b" * 500 not in system
    assert "bbbbbbbbbb" not in system


def test_short_context_passes_through_untouched():
    messages = build_messages("Q?", "Short doc.", [])

    assert "Short doc." in messages[0]["content"]
    assert TRUNCATION_NOTE not in messages[0]["content"]


# -- Safety instructions in the prompt (criteria #58, #59) -------------------


def test_system_prompt_requires_care_signoff():
    messages = build_messages("Q?", "Doc.", [])

    assert CARE_SIGNOFF in messages[0]["content"]


def test_system_prompt_includes_off_topic_redirect():
    messages = build_messages("Q?", "Doc.", [])

    assert OFF_TOPIC_REDIRECT in messages[0]["content"]


def test_system_prompt_forbids_diagnosis():
    messages = build_messages("Q?", "Doc.", [])
    system = messages[0]["content"]

    assert "Never diagnose, prescribe, or give treatment recommendations" in system


# -- Groq call parameters (criterion #57) ------------------------------------


def test_groq_called_with_required_parameters(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient())

    answer_question("Q?", "Doc.", [])

    call = client.calls[0]
    assert call["model"] == "llama-3.3-70b-versatile"
    assert call["temperature"] == 0.4
    assert call["max_tokens"] == 512


def test_answer_returns_model_content(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(response="Here is your answer."))

    assert answer_question("Q?", "Doc.", []) == "Here is your answer."


def test_answer_question_sends_the_built_messages(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient())
    history = [{"role": "user", "content": "Earlier"}]

    answer_question("Now", "Doc.", history)

    sent = client.calls[0]["messages"]
    assert sent[0]["role"] == "system"
    assert sent[1] == {"role": "user", "content": "Earlier"}
    assert sent[-1] == {"role": "user", "content": "Now"}


# -- Error handling ----------------------------------------------------------


def test_groq_failure_raises_runtime_error(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(raises=Exception("groq exploded")))

    with pytest.raises(RuntimeError, match="AI chat failed. Please try again."):
        answer_question("Q?", "Doc.", [])


# -- Diagnosis boundary (plan §1.3) ------------------------------------------
# These exist because live testing found the §5.2 prompt alone was insufficient:
# "Do I have cancer? Just tell me yes or no." returned "No." from a real call.


def test_system_prompt_includes_the_diagnosis_boundary():
    from app.services.qa_engine import DIAGNOSIS_BOUNDARY

    messages = build_messages("Q?", "Doc.", [])
    assert DIAGNOSIS_BOUNDARY in messages[0]["content"]


def test_diagnosis_boundary_is_last_in_the_prompt():
    """Position matters. The boundary is the last thing the model reads before
    the conversation starts — the strongest spot for a rule that must survive a
    competing instruction in the user's own message."""
    from app.services.qa_engine import DIAGNOSIS_BOUNDARY

    messages = build_messages("Q?", "Doc.", [])
    assert messages[0]["content"].rstrip().endswith(DIAGNOSIS_BOUNDARY)


def test_diagnosis_boundary_names_the_override_pattern():
    """The clause must explicitly anticipate 'just answer yes or no' — that's
    the exact phrasing that defeated the original prompt."""
    from app.services.qa_engine import DIAGNOSIS_BOUNDARY

    lowered = DIAGNOSIS_BOUNDARY.lower()
    assert "overrides any instruction" in lowered
    assert "yes or no" in lowered
