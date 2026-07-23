"""Tests for the health metrics extraction engine.

Groq is mocked throughout. Most of these test the parsing and validation layer,
because that is where this engine actually earns its keep — an LLM asked for
JSON returns something JSON-adjacent often enough that defensive parsing is the
whole job.
"""

from datetime import date

from app.services import metrics_extractor
from app.services.metrics_extractor import extract_health_metrics


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
    def __init__(self, response="[]", raises=None):
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
    def __init__(self, response="[]", raises=None):
        self.completions = _FakeCompletions(response=response, raises=raises)
        self.chat = _FakeChat(self.completions)

    @property
    def calls(self):
        return self.completions.calls


def _install(monkeypatch, client):
    monkeypatch.setattr(metrics_extractor, "groq_client", client)
    return client


GOOD_JSON = """[
  {"metric_name": "Hemoglobin", "metric_value": 10.8, "unit": "g/dL",
   "reference_range": "12.0-16.0", "test_date": "2026-07-02", "status": "abnormal"},
  {"metric_name": "Platelet Count", "metric_value": 289, "unit": "K/uL",
   "reference_range": "150-400", "test_date": "2026-07-02", "status": "normal"}
]"""


def test_extracts_well_formed_metrics(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(response=GOOD_JSON))
    metrics = extract_health_metrics("some lab report text")
    assert len(metrics) == 2
    assert metrics[0]["metric_name"] == "Hemoglobin"
    assert metrics[0]["metric_value"] == 10.8
    assert metrics[0]["unit"] == "g/dL"
    assert metrics[0]["status"] == "abnormal"
    assert metrics[0]["test_date"] == date(2026, 7, 2)


def test_empty_array_returns_empty_list(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(response="[]"))
    assert extract_health_metrics("a document with no lab values") == []


def test_groq_called_with_required_parameters(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(response="[]"))
    extract_health_metrics("text")
    call = client.calls[0]
    assert call["model"] == "llama-3.3-70b-versatile"
    assert call["temperature"] == 0.1
    assert call["max_tokens"] == 2048


def test_strips_markdown_code_fences(monkeypatch):
    fenced = f"```json\n{GOOD_JSON}\n```"
    _install(monkeypatch, _FakeGroqClient(response=fenced))
    assert len(extract_health_metrics("text")) == 2


def test_handles_prose_around_the_array(monkeypatch):
    chatty = f"Here are the metrics I found:\n\n{GOOD_JSON}\n\nLet me know if you need more."
    _install(monkeypatch, _FakeGroqClient(response=chatty))
    assert len(extract_health_metrics("text")) == 2


def test_invalid_json_returns_empty_list(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(response="I couldn't find any metrics."))
    assert extract_health_metrics("text") == []


def test_non_array_json_returns_empty_list(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(response='{"metric_name": "Hemoglobin"}'))
    assert extract_health_metrics("text") == []


def test_groq_failure_returns_empty_list(monkeypatch):
    _install(monkeypatch, _FakeGroqClient(raises=Exception("groq exploded")))
    assert extract_health_metrics("text") == []


def test_drops_metrics_with_no_name(monkeypatch):
    bad = '[{"metric_value": 10.8, "unit": "g/dL"}]'
    _install(monkeypatch, _FakeGroqClient(response=bad))
    assert extract_health_metrics("text") == []


def test_drops_metrics_with_non_numeric_value(monkeypatch):
    bad = '[{"metric_name": "Hemoglobin", "metric_value": "not a number"}]'
    _install(monkeypatch, _FakeGroqClient(response=bad))
    assert extract_health_metrics("text") == []


def test_recovers_numeric_value_from_string(monkeypatch):
    messy = '[{"metric_name": "Hemoglobin", "metric_value": "10.8 g/dL"}]'
    _install(monkeypatch, _FakeGroqClient(response=messy))
    metrics = extract_health_metrics("text")
    assert len(metrics) == 1
    assert metrics[0]["metric_value"] == 10.8


def test_keeps_good_metrics_and_drops_bad_ones(monkeypatch):
    mixed = """[
      {"metric_name": "Hemoglobin", "metric_value": 10.8},
      {"metric_name": "", "metric_value": 5},
      {"metric_name": "Glucose", "metric_value": 108}
    ]"""
    _install(monkeypatch, _FakeGroqClient(response=mixed))
    metrics = extract_health_metrics("text")
    assert len(metrics) == 2
    assert [m["metric_name"] for m in metrics] == ["Hemoglobin", "Glucose"]


def test_unknown_status_is_normalised(monkeypatch):
    odd = '[{"metric_name": "Hemoglobin", "metric_value": 10.8, "status": "very bad"}]'
    _install(monkeypatch, _FakeGroqClient(response=odd))
    assert extract_health_metrics("text")[0]["status"] == "unknown"


def test_missing_status_defaults_to_unknown(monkeypatch):
    no_status = '[{"metric_name": "Hemoglobin", "metric_value": 10.8}]'
    _install(monkeypatch, _FakeGroqClient(response=no_status))
    assert extract_health_metrics("text")[0]["status"] == "unknown"


def test_null_like_strings_become_none(monkeypatch):
    nulls = """[{"metric_name": "Hemoglobin", "metric_value": 10.8,
                 "unit": "N/A", "reference_range": "null", "test_date": "unknown"}]"""
    _install(monkeypatch, _FakeGroqClient(response=nulls))
    metric = extract_health_metrics("text")[0]
    assert metric["unit"] is None
    assert metric["reference_range"] is None
    assert metric["test_date"] is None


def test_bad_date_becomes_none(monkeypatch):
    bad_date = '[{"metric_name": "Hemoglobin", "metric_value": 10.8, "test_date": "July 2nd"}]'
    _install(monkeypatch, _FakeGroqClient(response=bad_date))
    assert extract_health_metrics("text")[0]["test_date"] is None


def test_empty_document_skips_the_api_call(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(response=GOOD_JSON))
    assert extract_health_metrics("") == []
    assert client.calls == []


def test_long_document_is_truncated(monkeypatch):
    client = _install(monkeypatch, _FakeGroqClient(response="[]"))
    extract_health_metrics("x" * 10000)
    sent = client.calls[0]["messages"][-1]["content"]
    assert len(sent) < 10000
