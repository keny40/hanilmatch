# HanilMatch MVP Deployment Checklist

This document mirrors the current README deployment checklist. Use `README.md` as the primary source for local run commands, environment variables, SQL order, Google OAuth, OpenAI translation, and storage notes.

## Required verification

- [ ] Backend: `python -m compileall -q app`
- [ ] Backend: `python -c "import app.main; print('ok')"`
- [ ] Frontend: `npm run build`
- [ ] Frontend: `npx tsc --noEmit`

## Environment

- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Copy `frontend/.env.local.example` to `frontend/.env.local`
- [ ] Set production `DATABASE_URL`
- [ ] Set a strong `JWT_SECRET_KEY`
- [ ] Set production `FRONTEND_URL`, `FRONTEND_BASE_URL`, and `CORS_ORIGINS`
- [ ] Register Google OAuth production redirect URI
- [ ] Set `OPENAI_API_KEY` if translation should work in staging/production
- [ ] Confirm `ADMIN_EMAILS=keny4000@gmail.com`
- [ ] Keep payment keys in sandbox/test mode only
- [ ] Keep real secrets out of git and documentation

## Database

Apply SQL files from the repository root in this order:

1. `001_users.sql`
2. `002_profiles.sql`
3. `003_matches.sql`
4. `004_messages.sql`
5. `005_reports.sql`
6. `007_matching_automation.sql`
7. `011_profile_mvp_fields.sql`
8. `012_inquiries.sql`
9. `013_update_inquiry_statuses.sql`
10. `014_inquiry_admin_note.sql`
11. `015_google_oauth_fields.sql`
12. `016_community_posts.sql`
13. `017_translation_cache.sql`
14. `018_community_immediate_public.sql`

Seed files are optional and should be used only for local test data.

## Storage

- [ ] Create `backend/storage/profile_photos` if it does not exist
- [ ] Confirm backend process read/write permissions
- [ ] Prepare backup policy for uploaded profile photos
- [ ] Do not commit `backend/storage`

## MVP flow

- [ ] Admin login and `/admin` access
- [ ] Profile create/update and photo upload
- [ ] Daily automatic matching execution
- [ ] `/matches` connected match display
- [ ] Chat message send and translation
- [ ] Report create and admin status update
- [ ] Contact inquiry create and admin note save
- [ ] Community post create, approve, hide, and reject
- [ ] Community post appears publicly immediately after creation
- [ ] Billing page shows MVP sandbox/test mode information only and does not start real payment

## Production policy reminders

HanilMatch is currently an MVP test service. Before public production operation, review terms, privacy policy, payment policy, moderation policy, report/block handling, data retention, and cross-border KR/JP data handling.
