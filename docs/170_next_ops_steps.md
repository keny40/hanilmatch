# Next Ops Steps

## Implemented now

- CSRF protection for cookie-authenticated write requests
- Access token + refresh token cookie flow
- Match acceptance from the web UI
- Conversation page for matched users
- Translation worker scaffold with pending-message processing
- Profile photo upload metadata and local file serving

## Best next production moves

1. Replace placeholder translation logic with a real provider adapter.
2. Store profile media in S3-compatible object storage.
3. Add CSRF strategy documentation for frontend forms and mobile clients.
4. Add refresh-token revocation or session table storage.
5. Add WebSocket or SSE for near-realtime chat updates.
