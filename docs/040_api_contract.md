# KR-JP Match API Contract

## Base principles

- REST JSON API
- Authentication: Bearer JWT
- Time format: ISO 8601 in UTC
- Text encoding: UTF-8
- Pagination: cursor or `limit` + `offset` for MVP

## Auth and users

### `POST /api/v1/auth/signup`
- Create user account
- Request body:
```json
{
  "email": "minsu@example.com",
  "password": "strong-password",
  "gender": "male",
  "nationality": "KR",
  "language": "ko"
}
```

### `GET /api/v1/users/me`
- Return authenticated user

### `PATCH /api/v1/users/me`
- Update language or verification-related flags managed by admin workflows

## Profiles

### `POST /api/v1/profiles`
- Create profile for current user

### `GET /api/v1/profiles/me`
- Return my profile

### `PATCH /api/v1/profiles/me`
- Update age, bio, interests

### `GET /api/v1/profiles/{user_id}`
- Return public profile summary

## Matches

### `GET /api/v1/matches/recommendations`
- Return recommended profiles
- Query params:
  - `limit`
  - `min_score`

### `POST /api/v1/matches`
- Create a match record for two users when recommendation is accepted

### `GET /api/v1/matches`
- Return my match list

## Messages

### `POST /api/v1/messages`
- Send a message to a matched user
- Request body:
```json
{
  "receiver_id": "33333333-3333-3333-3333-333333333333",
  "original_text": "안녕하세요",
  "language_from": "ko",
  "language_to": "ja"
}
```

### `GET /api/v1/messages`
- Query params:
  - `match_user_id`
  - `limit`
  - `offset`

## Reports

### `POST /api/v1/reports`
- Submit abuse or trust report

### `GET /api/v1/reports/me`
- Return reports filed by current user

## Suggested response shape

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid"
  },
  "error": null
}
```

## Recommended future endpoints

- `POST /api/v1/blocks`
- `GET /api/v1/admin/reports`
- `POST /api/v1/translations/preview`
- `POST /api/v1/verification-requests`
