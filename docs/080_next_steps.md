# Recommended Next Build Steps

## Immediate

1. Freeze the current PostgreSQL schema as `v1`.
2. Add missing auth-related tables or fields.
3. Scaffold FastAPI project structure.
4. Add SQLAlchemy models and Alembic migrations.
5. Build signup, profile, match list, and message APIs.

## After backend skeleton

1. Connect Next.js webapp to auth and profile APIs.
2. Add recommendation query and match acceptance flow.
3. Add chat UI with translation status.
4. Add report submission modal and moderation review page.

## Data model caution

- Current `users` table is fine for domain identity, but production web login usually needs password or external auth metadata.
- Current `messages` table supports translation MVP, but read receipts and delivery status will likely be needed.
- Current `matches` table stores accepted or generated pairs, but you may later want a `match_status` column.
