# Realtime And Sessions

## Added now

- Refresh-session management API and web UI
- Message `read_at` tracking
- WebSocket reconnect loop in chat UI
- S3 presigned upload flow with photo registration endpoint

## User-facing outcomes

- Chat page now shows socket connection state and read status
- Users can revoke active refresh sessions from `/settings/sessions`
- Profile photo upload can switch between direct backend upload and presigned S3 upload

## Next improvements

1. Mark conversations as delivered/read through dedicated events instead of read-on-fetch only.
2. Add heartbeat/ping handling for WebSocket presence.
3. Add current-session labeling in the session UI.
4. Add upload completion verification callback for S3 flows.
