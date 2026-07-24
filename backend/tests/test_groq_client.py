"""Unit tests for the Groq client singleton (AI-202)."""

import sys

import pytest


def _reload_groq_client():
    """Force a fresh import so the module-level code re-executes."""
    sys.modules.pop("app.services.groq_client", None)
    import app.services.groq_client as module
    return module


def test_groq_client_importable_when_key_present(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "test-key-123")
    module = _reload_groq_client()
    assert module.groq_client is not None


def test_groq_client_raises_when_key_absent(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    # Patch load_dotenv at its source so a real local .env can't silently
    # repopulate the key when the module re-imports.
    monkeypatch.setattr("dotenv.load_dotenv", lambda *a, **k: None)
    with pytest.raises(
        EnvironmentError,
        match="GROQ_API_KEY is not set. Add it to your .env file.",
    ):
        _reload_groq_client()
