# Backend Folder Plan

## Current structure

```text
backend/
  .env.example
  README.md
  requirements.txt
  app/
    main.py
    api/
      deps.py
      router.py
      v1/
        endpoints/
    core/
      config.py
    db/
      base.py
      init_db.py
      session.py
    models/
      user.py
      profile.py
      match.py
      message.py
      report.py
    schemas/
      user.py
      profile.py
      match.py
      message.py
      report.py
```

## Why this layout works

- `api` keeps HTTP routing separate from data models.
- `schemas` define request and response contracts for the webapp.
- `models` map directly to PostgreSQL tables.
- `core` keeps settings isolated for later JWT, CORS, and logging config.
- `db` gives one place to attach migrations and session management.

## Recommended next folders

- `app/crud/` for DB queries
- `app/services/` for matching, translation, and moderation logic
- `app/tests/` for API and DB tests
- `alembic/` for migrations
