"""Integration tests for the auth flow.

Unlike the other tests, these make real HTTP requests against the real app —
routes, dependencies, database, the lot — using FastAPI's TestClient and a
throwaway in-memory SQLite database.

Why these exist: on 2026-07-05 a merge conflict resolution dropped `user` from
AuthService.login()'s return. The router unpacks three values, so every login
raised and returned a 500. It sat on the branch for eleven days. Nothing caught
it — the app imported fine, lint was clean, and all 37 unit tests passed,
because not one of them called the login endpoint.

That's the gap these close: the space between "it imports" and "it works".
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# In-memory SQLite. StaticPool keeps every connection pointed at the same
# database — without it each connection gets its own empty one.
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


@pytest.fixture
def client():
    """A TestClient wired to a fresh, empty database for each test."""
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


CREDS = {"email": "integration@test.com", "password": "test1234"}


def test_register_then_login_then_me(client):
    """The whole flow: create an account, log in, use the token."""
    r = client.post("/api/v1/auth/register", json=CREDS)
    assert r.status_code in (200, 201), r.text

    r = client.post("/api/v1/auth/login", json=CREDS)
    assert r.status_code == 200, r.text

    token = r.json()["access_token"]
    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    assert r.json()["email"] == CREDS["email"]


def test_login_returns_the_full_contract_shape(client):
    """The exact regression from 2026-07-05.

    login() must return the user object, not just the tokens. If someone drops
    it again, this fails loudly instead of 500ing silently in production.
    """
    client.post("/api/v1/auth/register", json=CREDS)
    r = client.post("/api/v1/auth/login", json=CREDS)

    assert r.status_code == 200, r.text
    body = r.json()

    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert "user" in body, "login must return the user object (see 27d391d)"
    assert body["user"]["email"] == CREDS["email"]
    assert "id" in body["user"]
    assert "role" in body["user"]
    assert "password" not in body["user"]
    assert "hashed_password" not in body["user"]


def test_login_sets_the_refresh_cookie_on_the_auth_path(client):
    """The cookie must be scoped to /api/v1/auth or the browser won't send it
    to /refresh and /logout. This has broken twice before."""
    client.post("/api/v1/auth/register", json=CREDS)
    r = client.post("/api/v1/auth/login", json=CREDS)

    cookie_header = r.headers.get("set-cookie", "")
    assert "refresh_token=" in cookie_header
    assert "HttpOnly" in cookie_header
    assert "Path=/api/v1/auth" in cookie_header


def test_protected_route_rejects_missing_token(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_protected_route_rejects_garbage_token(client):
    r = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert r.status_code == 401


def test_login_with_wrong_password_is_401_not_500(client):
    client.post("/api/v1/auth/register", json=CREDS)
    r = client.post(
        "/api/v1/auth/login",
        json={"email": CREDS["email"], "password": "wrong-password"},
    )
    assert r.status_code == 401
