"""Health metrics extraction engine (plan §6).

Pulls structured lab values and vital signs out of a medical document so the
health dashboard can chart them. Where the summarizer produces prose, this
produces data: one row per measurement, with the value, unit, reference range,
and whether it falls inside that range.

The model is asked for a strict JSON array and nothing else. That is why the
temperature is far lower than the other engines (0.1 rather than 0.3/0.4) —
prose benefits from a little variation, parseable JSON does not.

LLM JSON output is not reliable enough to trust directly, so everything the
model returns is treated as untrusted input: the response is unwrapped from any
markdown fencing, parsed defensively, and every object is validated field by
field. Anything malformed is dropped rather than allowed to reach the database.
A failed extraction returns an empty list — a document with no lab values is a
normal outcome, not an error.
"""

import json
import logging
import re
from datetime import date, datetime

from app.services.groq_client import groq_client

logger = logging.getLogger(__name__)

# --- Groq call configuration (plan §6.2) ---
MODEL = "llama-3.3-70b-versatile"
TEMPERATURE = 0.1
MAX_TOKENS = 2048

# Documents longer than this are truncated before extraction (plan §6.2).
MAX_DOCUMENT_CHARS = 8000

VALID_STATUSES = {"normal", "borderline", "abnormal", "unknown"}

# --- The approved extraction prompt (plan §6.1) ---
SYSTEM_PROMPT = """You are a medical data extraction assistant. Extract all lab values, vital signs, and health metrics from the medical document below. Return ONLY a valid JSON array. Each object must follow this exact schema:

[
  {
    "metric_name": "string (e.g., Blood Glucose, HDL Cholesterol)",
    "metric_value": number,
    "unit": "string (e.g., mg/dL, mmHg, %)",
    "reference_range": "string (e.g., 70-99 mg/dL) or null if not available",
    "test_date": "YYYY-MM-DD string or null if not available",
    "status": "normal | borderline | abnormal | unknown"
  }
]

If no metrics are found, return an empty array: []
Do not include any explanation or text outside the JSON array."""


def _strip_code_fences(text: str) -> str:
    """Remove markdown fencing the model may wrap around its JSON."""
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _extract_json_array(text: str) -> str:
    """Pull the outermost JSON array out of a response."""
    text = _strip_code_fences(text)
    if text.startswith("["):
        return text

    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


def _coerce_value(raw) -> float | None:
    """Return a float, or None if the value isn't numeric."""
    if isinstance(raw, (int, float)) and not isinstance(raw, bool):
        return float(raw)
    if isinstance(raw, str):
        match = re.search(r"-?\d+(?:\.\d+)?", raw)
        if match:
            try:
                return float(match.group())
            except ValueError:
                return None
    return None


def _coerce_date(raw) -> date | None:
    """Parse a YYYY-MM-DD string into a date. Anything else becomes None."""
    if not raw or not isinstance(raw, str):
        return None
    try:
        return datetime.strptime(raw.strip()[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def _clean_optional_str(raw) -> str | None:
    if raw is None:
        return None
    if not isinstance(raw, str):
        return None
    cleaned = raw.strip()
    if not cleaned or cleaned.lower() in {"null", "none", "n/a", "na"}:
        return None
    return cleaned


def _validate_metric(item) -> dict | None:
    """Validate one extracted metric. Returns a clean dict, or None to drop it."""
    if not isinstance(item, dict):
        return None

    name = _clean_optional_str(item.get("metric_name"))
    if not name:
        return None

    value = _coerce_value(item.get("metric_value"))
    if value is None:
        return None

    status = _clean_optional_str(item.get("status"))
    status = status.lower() if status else None
    if status not in VALID_STATUSES:
        status = "unknown"

    return {
        "metric_name": name,
        "metric_value": value,
        "unit": _clean_optional_str(item.get("unit")),
        "reference_range": _clean_optional_str(item.get("reference_range")),
        "test_date": _coerce_date(item.get("test_date")),
        "status": status,
    }


def extract_health_metrics(document_text: str) -> list[dict]:
    """Extract structured lab values from a medical document.

    Returns a list of validated metric dicts. Empty if the document contains no
    lab values, or if extraction or parsing failed — callers treat an empty list
    as a normal outcome, not an error (plan §6.2).
    """
    document_text = (document_text or "").strip()
    if not document_text:
        return []

    if len(document_text) > MAX_DOCUMENT_CHARS:
        logger.warning(
            "Document truncated for metrics extraction: %d chars -> %d",
            len(document_text),
            MAX_DOCUMENT_CHARS,
        )
        document_text = document_text[:MAX_DOCUMENT_CHARS]

    try:
        response = groq_client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Document:\n{document_text}"},
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )
        raw = response.choices[0].message.content or ""
    except Exception:
        logger.exception("Metrics extraction: Groq call failed")
        return []

    try:
        parsed = json.loads(_extract_json_array(raw))
    except (json.JSONDecodeError, ValueError):
        logger.warning("Metrics extraction: response was not valid JSON")
        return []

    if not isinstance(parsed, list):
        logger.warning("Metrics extraction: expected a JSON array")
        return []

    metrics = []
    for item in parsed:
        cleaned = _validate_metric(item)
        if cleaned is not None:
            metrics.append(cleaned)

    logger.info(
        "Metrics extraction: %d of %d objects passed validation",
        len(metrics),
        len(parsed),
    )
    return metrics
