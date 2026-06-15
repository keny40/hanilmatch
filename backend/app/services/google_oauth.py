import secrets
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"


def google_oauth_enabled() -> bool:
    return bool(settings.google_client_id and settings.google_client_secret and settings.google_redirect_uri)


def create_google_oauth_state() -> str:
    return secrets.token_urlsafe(32)


def build_google_auth_url(state: str) -> str:
    if not google_oauth_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )
    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "select_account",
        }
    )
    return f"{GOOGLE_AUTH_URL}?{query}"


async def fetch_google_userinfo(code: str) -> dict:
    if not google_oauth_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )

    async with httpx.AsyncClient(timeout=10.0) as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_response.status_code >= 400:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google login failed")
        token_payload = token_response.json()

        id_token = token_payload.get("id_token")
        id_claims = jwt.decode(id_token, options={"verify_signature": False}) if id_token else {}
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_payload.get('access_token')}"},
        )
        if userinfo_response.status_code >= 400:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google login failed")
        userinfo = userinfo_response.json()

    return {**id_claims, **userinfo}


def upsert_google_user(db: Session, userinfo: dict) -> User:
    email = str(userinfo.get("email") or "").strip().lower()
    google_sub = str(userinfo.get("sub") or "").strip()
    email_verified = userinfo.get("email_verified") is True or str(userinfo.get("email_verified")).lower() == "true"
    if not email or not google_sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google account email is required")
    if not email_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Google email is not verified")

    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(
            email=email,
            password_hash=hash_password(secrets.token_urlsafe(32)),
            gender="male",
            nationality="KR",
            language="ko",
            auth_provider="google",
            google_id=google_sub,
            avatar_url=userinfo.get("picture"),
            email_verified=True,
            is_verified=True,
        )
        db.add(user)
    else:
        user.google_id = user.google_id or google_sub
        user.auth_provider = "google" if user.auth_provider == "email" else user.auth_provider
        user.avatar_url = userinfo.get("picture") or user.avatar_url
        user.email_verified = True
        user.is_verified = True

    db.commit()
    db.refresh(user)
    return user
