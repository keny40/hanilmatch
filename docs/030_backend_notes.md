# Backend Notes

## Recommended API module split

- `users`: signup, verification status, user lookup
- `profiles`: create and update profile, interests, age validation
- `matches`: recommendation, pair creation, match score retrieval
- `messages`: chat history, translation pipeline, pagination
- `reports`: abuse report submission and moderation review

## Practical backend rules

- Enforce `user1_id < user2_id` in service code before inserting into `matches`.
- Create a profile immediately after user signup so matching queries can assume profile existence.
- Only allow messaging when a valid match exists between two users.
- Keep `original_text` immutable and regenerate `translated_text` when translation quality improves.
- Log report creation to an admin event stream for moderation workflows.

## Suggested next tables

- `blocks`: prevent unwanted contact before or after matching
- `verification_requests`: track ID, selfie, or video review lifecycle
- `subscriptions`: premium features and billing status
- `match_preferences`: preferred age range, region, language level, relationship goals
- `audit_logs`: security and moderation traceability
