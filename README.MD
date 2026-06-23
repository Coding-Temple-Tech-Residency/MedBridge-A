MedBridge-A — Frontend
AI-Powered Patient Health Companion. This repository holds the frontend web app: patients upload or paste a medical document and receive a plain-language summary, a health dashboard, and actionable next steps.

Tech stack: React 18 · TypeScript · Vite · Tailwind CSS · Recharts

Project Information
Project Name: MedBridge-A
Team Name: (fill in)
Cohort / Sprint: Sprint 1 — Foundation & Infrastructure
Team Members: (fill in)
Frontend Setup
Prerequisites
Node.js 18+ and npm (check with node -v)
Getting started
# 1. Clone and enter the repo
git clone https://github.com/Coding-Temple-Tech-Residency/MedBridge-A.git
cd MedBridge-A

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env        # then open .env and adjust values if needed

# 4. Start the dev server
npm run dev                 # serves at http://localhost:5173
The app boots at the URL Vite prints (default http://localhost:5173).

Environment variables
All client-side env vars must be prefixed with VITE_ (Vite only exposes those). They are validated at startup by src/env.ts — a missing or malformed value throws a clear error immediately instead of failing silently later.

Variable	Required	Description	Example
VITE_API_BASE_URL	Yes	Base URL of the MedBridge backend.	http://localhost:8000


Available scripts
Script	What it does
npm run dev	Start the Vite dev server with hot reload.
npm run build	Type-check and produce a production build.
npm run preview	Serve the production build locally.
npm run lint	Run ESLint over the codebase (zero warnings = OK).
npm run format	Format all files with Prettier.
npm run format:check	Check formatting without writing changes.




Project structure
src/
  components/    Page + UI components (Login, Landing, Upload, Results, Header, Logo)
  env.ts         Validated environment-variable access
  mockData.ts    Sample report + mock analysis result (placeholder until API is wired)
  types.ts       Shared TypeScript types
  App.tsx        Top-level view switching
  main.tsx       React entry point





Notes / known limitations
The analysis flow currently runs on mock data (src/mockData.ts); the backend API is not yet wired in. Login and document analysis are simulated.
Auth is UI-only at this stage — real POST /api/auth/* calls, JWT storage, and protected routing are tracked in later Sprint 1 issues (FE-05, FE-06, FE-07) and depend on the API-contract sync (FE-08).



Development standards
Clean, modular, well-named code; no stray console.logs or unused files.
npm run lint and npm run format:check pass before opening a PR.

Meaningful commit messages; keep main green — no broken pushes.

Review teammates' PRs respectfully and constructively

Intellectual Property Notice
This project was created as part of a Coding Temple Tech Residency. All work produced during the residency is considered the intellectual property of Coding Temple or the sponsoring employer, unless otherwise stated in a signed agreement. By contributing, you acknowledge and agree to these terms.


# Healthcare App — Backend

FastAPI + PostgreSQL backend for the patient-facing AI health records app. Handles authentication, document upload, AI-generated summaries, the "Ask your records" Q&A, and the health-dashboard API.

> **Status:** Sprint 1 — environment, schema, and authentication. See [Roadmap](#roadmap).

## Tech stack

- **Python 3.11+** with **FastAPI**
- **PostgreSQL** (database: `healthcare`)
- **SQLAlchemy 2.0** (sync) for the ORM
- **Alembic** for schema migrations
- **JWT** auth with bcrypt-hashed passwords

## Prerequisites

- Python 3.11 or newer
- PostgreSQL 14+ running locally
- `git`

## Getting started

```bash
# 1. Clone the repo and enter the backend
git clone <repo-url>
cd healthcare-app/backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env              # then open .env and fill in real values

# 5. Create the database (one time)
createdb healthcare               # or: psql -c "CREATE DATABASE healthcare;"

# 6. Run migrations (once Alembic is set up)
# alembic upgrade head

# 7. Start the dev server
fastapi dev app/main.py
```