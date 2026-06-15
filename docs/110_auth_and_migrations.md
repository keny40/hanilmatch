# Auth And Migration Notes

## What changed

- Added `password_hash` to `users`
- Added JWT settings to backend config
- Added `/api/v1/auth/login`
- Added authenticated `/api/v1/auth/me`
- Replaced placeholder CRUD endpoints with DB-backed handlers
- Added Alembic scaffold and initial migration

## Important implementation note

- Seed users use `seed-password-hash` as a placeholder string. They are useful for relational test data, but not for real login until replaced with valid hashes.

## Suggested next hardening steps

- Add refresh tokens or short-lived access tokens with rotation
- Add email verification flow
- Add role or admin flag
- Add blocks table before opening chat broadly
