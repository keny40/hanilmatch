# Quick Start

## Backend local run

1. Create a Python virtual environment inside `backend`.
2. Install packages from `backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Update `DATABASE_URL` for your PostgreSQL instance.
5. Run `alembic upgrade head` from the `backend` folder.
6. Run `uvicorn app.main:app --reload`.

## Suggested first API checks

- `GET /health`
- `POST /api/v1/users/`
- `POST /api/v1/auth/login`
- `POST /api/v1/profiles/`
- `GET /api/v1/matches/recommendations`
