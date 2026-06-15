from fastapi import Response

from app.core.config import settings
from app.core.security import create_csrf_token


def apply_auth_cookies(response: Response, access_token: str, refresh_token: str) -> str:
    csrf_token = create_csrf_token()
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=settings.auth_cookie_secure,
        max_age=settings.jwt_access_token_expire_minutes * 60,
        path="/",
    )
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.auth_cookie_secure,
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
        path="/",
    )
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        samesite="lax",
        secure=settings.auth_cookie_secure,
        max_age=settings.jwt_refresh_token_expire_days * 24 * 60 * 60,
        path="/",
    )
    return csrf_token


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key=settings.auth_cookie_name, path="/", samesite="lax")
    response.delete_cookie(key=settings.refresh_cookie_name, path="/", samesite="lax")
    response.delete_cookie(key=settings.csrf_cookie_name, path="/", samesite="lax")
