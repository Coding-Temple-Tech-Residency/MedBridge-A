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

# 7. Start the dev server (run this from the backend folder)
cd backend
fastapi dev app/main.py
```
