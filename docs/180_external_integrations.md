# External Integrations

## Added in code

- Translation provider abstraction with `mock`, `deepl`, and `google`
- Storage provider abstraction with `local` and `s3`
- Refresh-token session persistence in database
- WebSocket chat endpoint for matched users

## Environment switches

- `TRANSLATION_PROVIDER=mock|deepl|google`
- `DEEPL_API_KEY=...`
- `GOOGLE_TRANSLATE_API_KEY=...`
- `STORAGE_BACKEND=local|s3`
- `S3_BUCKET=...`
- `S3_REGION=...`
- `S3_ACCESS_KEY=...`
- `S3_SECRET_KEY=...`
- `S3_ENDPOINT_URL=...`

## Practical note

- The translation worker now calls a real HTTP API when the provider is set to `deepl` or `google`.
- Profile photo upload automatically uses S3 when `STORAGE_BACKEND=s3`; otherwise it saves under local `storage/`.
- Refresh tokens are rotated and persisted, but a richer session management UI is still a later step.
