# Webapp Architecture Notes

## Recommended stack

- Frontend: Next.js
- Backend API: FastAPI
- Database: PostgreSQL
- Cache / queue: Redis
- Object storage: S3-compatible storage
- Realtime chat: WebSocket gateway or managed realtime service
- Deployment: Docker containers behind Nginx or cloud load balancer

## Why this stack fits this project

- Next.js supports SEO-friendly landing pages and app routes in one web product.
- FastAPI is a strong match for typed backend APIs, auth flows, and translation integrations.
- PostgreSQL fits relational trust, moderation, and matching data better than document-first storage.
- Redis helps message fan-out, rate limiting, and short-lived translation jobs.

## Service split for later growth

- `web`: user-facing webapp
- `api`: core business API
- `worker`: async translation, moderation, and notifications
- `db`: PostgreSQL
- `redis`: caching and job broker

## Core non-functional requirements

- Email must be unique and case-normalized.
- Passwords must never be stored in plaintext.
- Messaging must be allowed only for active matches.
- Reports must be immutable after submission except for admin resolution metadata.
- Translation provider failure must not lose original message content.

## Webapp-specific additions to plan next

- Add `password_hash` to auth storage layer or separate auth table
- Add `last_login_at`
- Add `profile_images`
- Add `blocks`
- Add `verification_requests`
- Add `match_preferences`
- Add `message_read_at`
- Add soft-delete columns if account recovery is required
