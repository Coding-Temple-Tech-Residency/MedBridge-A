# Healthcare App — API Reference

This is the guide to talking to the backend. Whether you're on the frontend wiring up a screen or just trying to remember what `/login` hands back, you're in the right place. Everything here is the contract we've agreed on — and once the server's running, there's a live version at `/docs` that's generated straight from the code, so it's never out of date.

---

## How the API is shaped

The whole thing follows one idea: the URL names a *thing*, and the HTTP method says what you're doing to it. So there's no `/getUser` or `/createDocument` floating around — just `/users` and `/documents`, where GET reads, POST creates, PATCH updates, and DELETE removes. Learn one resource and you can pretty much guess the rest.

A few house rules on top of that:

- Resource names are plural and hyphenated: `/lab-results`, never `/lab_results`.
- When one thing belongs to another, it nests — a message lives inside a conversation, so it's `/conversations/{id}/messages`.
- Auth is the odd one out. Logging in isn't really a "resource," so those endpoints live under `/auth/` with action-style names. That's on purpose, not an inconsistency.
- And not every database table gets a route. `sessions` and `audit_log` do their work quietly behind the scenes, so you won't find public endpoints for them.

## Where everything lives

Every route sits under:

```
/api/v1
```

The version number is there on purpose — it lets us change things down the road without pulling the rug out from anyone already building against the API.

## How auth works (worth reading before you wire up login)

We use JWTs with a refresh-token setup. Two tokens, two different jobs:

- The **access token** is the short-lived one (~15 minutes). Your app sends it on every authenticated request, in the header: `Authorization: Bearer <access_token>`.
- The **refresh token** is the long-lived one (~7 days), and here's the nice part — you never actually handle it. The server tucks it into an httpOnly cookie that the browser manages on its own. When the access token expires, you call `/auth/refresh` and get a fresh one.

Why a cookie instead of just handing you the token? An httpOnly cookie can't be read by JavaScript, so even if something malicious sneaks onto the page, it can't walk off with the refresh token. For a health app, that's well worth a little extra plumbing.

**So, frontend folks:** pull `access_token` out of the login response and send it on your requests — and let the browser deal with the refresh cookie automatically. You shouldn't need to touch the refresh token directly at all.

---

## The routes at a glance

| Method | Route | What it does | Needs auth? | Scope |
|---|---|---|---|---|
| GET | `/health` | Quick "is the DB up?" check | no | done |
| POST | `/auth/register` | Make a new account | no | Sprint 1 |
| POST | `/auth/login` | Log in, get your tokens | no | Sprint 1 |
| POST | `/auth/refresh` | Trade the refresh cookie for a new access token | refresh cookie | Sprint 1 |
| POST | `/auth/logout` | End the current session | access token | Sprint 1 |
| GET | `/users/me` | "Who am I?" — the current user's profile | access token | Sprint 1 |
| GET / POST | `/documents` | List your documents / upload a new one | access token | Planned |
| GET / DELETE | `/documents/{id}` | Grab one / delete one | access token | Planned |
| POST | `/documents/{id}/summarize` | Kick off the AI summary | access token | Planned |
| GET | `/lab-results` | List lab results (this feeds the dashboard) | access token | Planned |
| GET / POST | `/conversations` | List threads / start a new one | access token | Planned |
| GET / POST | `/conversations/{id}/messages` | Read a thread / ask a question | access token | Planned |

---

## The Sprint 1 endpoints, up close

These are the ones being built right now, so here's exactly what to send and what you'll get back.

### Register — `POST /api/v1/auth/register`

Creates a new account. The password gets hashed the instant it arrives and is never stored or returned in plain text — so don't go looking for it later, it's gone on purpose.

Send:

```json
{
  "email": "jane@example.com",
  "password": "a-strong-password"
}
```

Get back — `201 Created`:

```json
{
  "id": 1,
  "email": "jane@example.com",
  "role": "patient",
  "created_at": "2026-06-15T18:30:00Z"
}
```

If something's off: `409` means that email is already taken, and `422` means the input didn't pass validation.

### Log in — `POST /api/v1/auth/login`

Checks the credentials and, if they're good, hands back an access token. The refresh token rides along as an httpOnly cookie on the response.

Send:

```json
{
  "email": "jane@example.com",
  "password": "a-strong-password"
}
```

Get back — `200 OK`:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "jane@example.com",
    "role": "patient"
  }
}
```

Plus a `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict` on the response — that's the refresh token, handled for you.

If something's off: `401` means the email or password was wrong, `422` means validation failed.

### Refresh — `POST /api/v1/auth/refresh`

When your access token has expired, call this to get a new one. There's no body to send — the server reads the refresh token straight from the cookie.

Get back — `200 OK`:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer"
}
```

If something's off: `401` means the refresh token is missing, expired, or has been revoked — at which point it's time to send the user back to the login screen.

### Log out — `POST /api/v1/auth/logout`

Ends the current session on the server (so that refresh token stops working) and clears the cookie. Needs a valid access token to call.

Get back — `204 No Content`. Nothing in the body; the empty success is the whole answer.

If something's off: `401` means you weren't authenticated to begin with.

### Who am I — `GET /api/v1/users/me`

Returns the profile of whoever's currently logged in. Send your access token in the header: `Authorization: Bearer <access_token>`.

Get back — `200 OK`:

```json
{
  "id": 1,
  "email": "jane@example.com",
  "role": "patient",
  "is_active": true,
  "created_at": "2026-06-15T18:30:00Z"
}
```

If something's off: `401` means the token was missing or invalid.

---

## When things go wrong

Errors come back in a consistent little shape, so you can handle them the same way everywhere:

```json
{ "detail": "A human-readable message" }
```

And the status codes you'll actually run into:

| Code | What it means |
|---|---|
| 200 | All good |
| 201 | Created something new |
| 204 | Worked, nothing to send back |
| 400 | The request was malformed |
| 401 | You're not logged in (or your token's bad) |
| 403 | You're logged in, but not allowed to do this |
| 404 | Couldn't find it |
| 409 | Clashes with something that already exists (e.g. duplicate email) |
| 422 | The data didn't validate |

## The live version

Once the backend is running, you don't have to take this file's word for anything — FastAPI generates the real, current contract from the code itself:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

This file is the friendly overview; `/docs` is the source of truth.
