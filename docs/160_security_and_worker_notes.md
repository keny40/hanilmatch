# Security And Worker Notes

## Added

- CSRF middleware for cookie-authenticated write requests
- Refresh-token cookie rotation endpoint
- Translation worker scaffold for pending messages
- Profile photo upload metadata and local file storage route

## Important caveats

- CSRF uses a double-submit cookie pattern and expects `X-CSRF-Token`.
- Refresh tokens are stateless JWTs for now. Rotation exists, but revocation storage is not added yet.
- Translation worker currently uses a deterministic placeholder translator. It is ready to swap with DeepL or Google Translate later.
- Profile photos are stored locally under `backend/storage/profile_photos` for development. Production should move to S3-compatible storage.
