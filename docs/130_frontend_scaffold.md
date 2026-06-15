# Frontend Scaffold

## What exists now

- `frontend/app/page.tsx`: landing page
- `frontend/app/signup/page.tsx`: signup form
- `frontend/app/login/page.tsx`: login form
- `frontend/lib/api.ts`: backend API helper
- `frontend/Dockerfile`: container build

## Why this matters

- The project now has both API and web entry points.
- New team members can see how browser requests should talk to the backend.
- Docker Compose can be expanded without redesigning the root structure.

## Recommended next UI pages

- `/onboarding/profile`
- `/matches`
- `/chat/[userId]`
- `/settings`
