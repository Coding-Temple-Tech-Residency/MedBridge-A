# MedBridge-A

AI-Powered Patient Health Companion. This repository holds the MedBridge web
app, where patients upload or paste a medical document and receive a plain-language
summary, a health dashboard, and actionable next steps.

**Tech stack:** React 18 · TypeScript · Vite · Tailwind CSS · Python · Recharts

---

## Project Information

- **Project Name:** MedBridge-A
- **Team Name:** _MedBridgeA_
- **Cohort / Sprint:** Sprint 2 — AI Development
- **Team Members:** Benny Bailey, Jake Mikiewicz, Shaney Hoyohoy, Zari Magnaye, Aramide Bhadmus, Warren Seals, Edward Quach

---

## Run The Application (Recommended)

Use Docker Compose to run both frontend and backend together.

### Prerequisites

- Docker Desktop (or Docker Engine + Compose plugin)

### Quick start

```bash
# 1) Clone and enter the repo
git clone https://github.com/Coding-Temple-Tech-Residency/MedBridge-A.git
cd MedBridge-A

# 2) Build and start backend + frontend
docker compose up --build
```

### URLs

- Frontend: http://localhost:3000
- Backend API root: http://localhost:8000
- Backend docs: http://localhost:8000/docs

### Stop the stack

```bash
docker compose down
```

### Demo flow to verify

1. Create a new account on `/register`.
2. Sign in on `/login`.
3. Upload a test document on `/upload`.
4. Review the generated results on `/results`.
5. Ask questions in `/chat`.
6. Manage appointments in `/profile`.

---

## Local Frontend Setup (Optional)

### Prerequisites

- **Node.js 18+** and npm (check with `node -v`)

### Getting started

```bash
# 1. Clone and enter the repo
git clone https://github.com/Coding-Temple-Tech-Residency/MedBridge-A.git
cd MedBridge-A

# 2. Enter the frontend app and install dependencies
cd frontend
npm install

# 3. Set up environment variables
cp .env.example .env        # then open frontend/.env and adjust values if needed

# 4. Start the dev server
npm run dev                 # serves at http://localhost:5173
```

The app boots at the URL Vite prints (default `http://localhost:5173`).

### Environment variables

All client-side env vars must be prefixed with `VITE_` (Vite only exposes those).
They are validated at startup by `frontend/src/env.ts` — a missing or malformed value
throws a clear error immediately instead of failing silently later.

| Variable            | Required | Description                        | Example                 |
| ------------------- | -------- | ---------------------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL of the MedBridge backend. | `http://localhost:8000` |

### Available scripts

| Script                 | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with hot reload.         |
| `npm run build`        | Type-check and produce a production build.         |
| `npm run preview`      | Serve the production build locally.                |
| `npm run lint`         | Run ESLint over the codebase (zero warnings = OK). |
| `npm run format`       | Format all files with Prettier.                    |
| `npm run format:check` | Check formatting without writing changes.          |

### Frontend CI

- Frontend CI runs from [.github/workflows/frontend-ci.yml](.github/workflows/frontend-ci.yml).
- It triggers on pull requests and pushes that modify frontend-related files.
- The workflow runs:
  - `npm ci`
  - `npm run lint`
  - `npm run build`

This ensures frontend changes pass linting and produce a valid production build
before merge.

---

## Local Backend Setup (Optional)

### Frontend deployment (Docker)

Use the root compose file to run a production-style frontend build and serve it
on port 3000.

```bash
# Build and run frontend + backend containers
docker-compose up --build
```

Key deployment detail:
- The frontend reads `VITE_API_BASE_URL` at build time (not runtime).
- Since this URL is used by the browser, it must be reachable from the user’s machine (typically `http://localhost:8000` when running compose locally; override as needed for production).

### FE-16 manual QA checklist

Run this before merge to confirm production readiness:
- `cd frontend && npm run lint`
- `cd frontend && npm run build`
- Start compose: `docker-compose up --build`
- Open `http://localhost:3000`
- Verify login flow works with backend auth endpoints
- Upload a test report and confirm upload success/error handling UX
- Open the AI chat flow and verify request/response handling (or clear fallback
  messaging if backend AI key/service is unavailable)

If backend dependencies (for example Supabase wiring) are still in progress,
frontend behavior should still be validated for loading, routing, errors, and
graceful failure states.

---

---

## Local Backend Setup (Optional)

### Prerequisites

- **Python 3.12+** and pip
- SQLite or PostgreSQL
- **Tesseract OCR** — required by `pytesseract` for image-based document parsing:
  `brew install tesseract` (macOS)

### Getting started

```bash
# 1. Enter the backend directory
cd backend

# 2. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env        # then open .env and fill in real values

# 5. Run database migrations
alembic upgrade head

# 6. Start the dev server
uvicorn app.main:app --reload    # serves at http://localhost:8000
```

### Environment Setup

All backend environment variables live in `backend/.env` (copied from `.env.example`, never committed). Missing required values will cause the app to fail on startup.

| Variable                       | Required | Description                                      | Example                                                    |
| ------------------------------- | -------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                  | Yes      | PostgreSQL connection string.                     | `postgresql+psycopg2://user:pass@localhost:5432/healthcare` |
| `JWT_SECRET_KEY`                | Yes      | Secret used to sign JWT access tokens.            | Generate via `openssl rand -hex 32`                          |
| `JWT_ALGORITHM`                 | Yes      | JWT signing algorithm.                            | `HS256`                                                       |
| `ACCESS_TOKEN_EXPIRE_MINUTES`   | Yes      | Access token lifetime, in minutes.                | `15`                                                          |
| `GROQ_API_KEY`                  | Yes      | API key for the Groq AI engine (Llama 3.3 70B).   | From [console.groq.com](https://console.groq.com)            |
| `SUPABASE_URL`                  | Yes      | Supabase project URL (used for Storage buckets).  | `https://xxxx.supabase.co`                                   |
| `SUPABASE_ANON_KEY`             | Yes      | Supabase anonymous/public API key.                | From Supabase project settings                               |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service-role key (server-side only, never exposed to the client). | From Supabase project settings          |

For Docker Compose demo runs in this branch, storage defaults to local filesystem via:

- `STORAGE_BACKEND=local`

This allows document upload to work without Supabase credentials.


## Project structure

```
frontend/
  src/
    components/  Page + UI components (Login, Landing, Upload, Results, Header, Logo)
    env.ts       Validated environment-variable access
    mockData.ts   Sample report + mock analysis result (placeholder until API is wired)
    types.ts      Shared TypeScript types
    App.tsx       Top-level view switching
    main.tsx      React entry point
```

---

## Notes / known limitations

- In environments where `GROQ_API_KEY` is empty, background AI summarization/metrics
  tasks will log connection errors.
- Chat remains usable in that case through the current fallback response behavior.

---

## Development standards

- Clean, modular, well-named code; no stray `console.log`s or unused files.
- `npm run lint` and `npm run format:check` pass before opening a PR.
- Meaningful commit messages; keep `main` green — no broken pushes.
- Review teammates' PRs respectfully and constructively.

---

## Intellectual Property Notice

This project was created as part of a Coding Temple Tech Residency. All work
produced during the residency is considered the intellectual property of Coding
Temple or the sponsoring employer, unless otherwise stated in a signed agreement.
By contributing, you acknowledge and agree to these terms.
