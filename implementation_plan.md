# KR-JP Match MVP Stabilization Plan

This document outlines the steps to inspect, stabilize, and run the `hanil-matching` project as an MVP based on existing code.

## User Review Required
> [!IMPORTANT]
> The database initialization will be switched to use PostgreSQL's native `/docker-entrypoint-initdb.d/` feature using `010_all_in_one_schema.sql` and `006_seed_sample.sql` instead of manually running `alembic upgrade head`. This ensures the DB is ready immediately upon `docker compose up`. Please confirm if this approach is preferred over Alembic for the MVP.

## Proposed Changes

### Docker and DB Initialization
- Modify `docker-compose.yml` to mount `010_all_in_one_schema.sql` and `006_seed_sample.sql` into the `postgres` container's `/docker-entrypoint-initdb.d/` directory.
- This will automatically create the schema and insert the test accounts (e.g., `minsu@example.com` and `yuki@example.jp`) on the first database start.

### Environment Variables
- Consolidate `.env.example`, `.env.docker`, and `.env.local.example`.
- Ensure `docker-compose.yml` loads the correct `.env` files for both frontend and backend.
- Document the final required environment variables.

### Backend API Check
- Inspect `backend/app/api/` for the following required routes:
  - Auth (Signup/Login)
  - Profile (View/Edit)
  - Matches (List/Action)
  - Chat (List/Send)
  - Reports
- Ensure these endpoints are functional and production-safe without major rewrites.

### Frontend Connections
- Inspect `frontend/lib/api.ts` (or equivalent) to ensure API calls point to the correct backend endpoints.
- Check that the UI for Login, Profile, Matching, Chat, and Reporting properly utilizes these APIs instead of mock data.

## Verification Plan

### Automated/Manual Tests
- Run `docker compose config` to validate compose syntax.
- Run `docker compose up --build -d` to start the stack.
- Access `http://localhost:8000/docs` to verify backend API readiness.
- Access `http://localhost:3000` to verify frontend readiness.
- Log in with seed test accounts (`minsu@example.com` or `yuki@example.jp` with password `seed-password-hash` or whichever is configured).
- Test Profile Update, Matching UI, and Chat message transmission manually.
