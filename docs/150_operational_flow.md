# Operational Flow

## Added in this round

- JWT now works through an HTTP-only cookie set at login
- Logout clears the auth cookie
- Match recommendations can be accepted from the web UI
- Recommended users can be inspected through a profile detail panel
- Accepted matches can open a chat page
- Chat page reads existing messages and sends new ones

## Current user journey

1. Sign up
2. Log in
3. Receive auth cookie from backend
4. Complete or edit onboarding profile
5. Review dashboard status
6. Open matches
7. View profile detail and accept a match
8. Open chat with matched user

## Good next production steps

- Replace simple JWT cookie flow with refresh token rotation
- Add CSRF protection strategy for cookie-authenticated write requests
- Add message translation worker and delivery status
- Add profile photos and verification request flow
