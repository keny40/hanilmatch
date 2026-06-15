from uuid import UUID
from urllib.parse import urlencode

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, is_admin_user
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User
from app.schemas.user import Token, UserLogin, UserRead
from app.services.auth import authenticate_user
from app.services.google_oauth import build_google_auth_url, create_google_oauth_state, fetch_google_userinfo, upsert_google_user
from app.services.refresh_sessions import create_refresh_session, get_refresh_session_by_jti, revoke_refresh_session
from app.services.token import apply_auth_cookies, clear_auth_cookies


router = APIRouter()
google_oauth_state_cookie = "krjp_google_oauth_state"


def issue_login_tokens(db: Session, request: Request, response: Response, user: User) -> str:
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    refresh_payload = jwt.decode(refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    create_refresh_session(
        db,
        user=user,
        token_jti=refresh_payload["jti"],
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    apply_auth_cookies(response, access_token, refresh_token)
    return access_token


@router.post("/login", response_model=Token)
def login(payload: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)) -> Token:
    user = authenticate_user(db, payload.email, payload.password)
    access_token = issue_login_tokens(db, request, response, user)
    return Token(access_token=access_token)


@router.get("/google/login")
def google_login() -> RedirectResponse:
    state = create_google_oauth_state()
    frontend_url = (settings.frontend_url or settings.frontend_base_url).rstrip("/")
    try:
        auth_url = build_google_auth_url(state)
    except HTTPException:
        return RedirectResponse(
            f"{frontend_url}/auth/google/callback?{urlencode({'error': 'google_not_configured'})}",
            status_code=status.HTTP_302_FOUND,
        )
    response = RedirectResponse(auth_url, status_code=status.HTTP_302_FOUND)
    response.set_cookie(
        key=google_oauth_state_cookie,
        value=state,
        httponly=True,
        samesite="lax",
        secure=settings.auth_cookie_secure,
        max_age=600,
        path=f"{settings.api_v1_prefix}/auth/google",
    )
    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    stored_state: str | None = Cookie(default=None, alias=google_oauth_state_cookie),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    frontend_url = (settings.frontend_url or settings.frontend_base_url).rstrip("/")
    failure_url = f"{frontend_url}/auth/google/callback?{urlencode({'error': 'google_login_failed'})}"
    if not code or not state or not stored_state or state != stored_state:
        response = RedirectResponse(failure_url, status_code=status.HTTP_302_FOUND)
        response.delete_cookie(key=google_oauth_state_cookie, path=f"{settings.api_v1_prefix}/auth/google")
        return response

    try:
        userinfo = await fetch_google_userinfo(code)
        user = upsert_google_user(db, userinfo)
        response = RedirectResponse(f"{frontend_url}/auth/google/callback", status_code=status.HTTP_302_FOUND)
        access_token = issue_login_tokens(db, request, response, user)
        response.headers["location"] = f"{frontend_url}/auth/google/callback?{urlencode({'access_token': access_token})}"
        response.delete_cookie(key=google_oauth_state_cookie, path=f"{settings.api_v1_prefix}/auth/google")
        return response
    except Exception:
        response = RedirectResponse(failure_url, status_code=status.HTTP_302_FOUND)
        response.delete_cookie(key=google_oauth_state_cookie, path=f"{settings.api_v1_prefix}/auth/google")
        return response


@router.get("/me", response_model=UserRead)
def get_authenticated_user(current_user: User = Depends(get_current_user)) -> UserRead:
    data = UserRead.model_validate(current_user).model_dump()
    data["is_admin"] = is_admin_user(current_user)
    return UserRead(**data)


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
) -> Response:
    if refresh_token:
        try:
            payload = jwt.decode(refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            token_jti = payload.get("jti")
            if token_jti:
                from app.db.session import SessionLocal
                with SessionLocal() as db:
                    revoke_refresh_session(db, token_jti)
        except jwt.InvalidTokenError:
            pass
    clear_auth_cookies(response)
    response.status_code = 204
    return response


@router.post("/refresh", response_model=Token)
def refresh_session(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=settings.refresh_cookie_name),
) -> Token:
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    try:
        payload = jwt.decode(refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        token_type = payload.get("type")
        token_jti = payload.get("jti")
        if subject is None or token_type != "refresh" or token_jti is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        UUID(subject)
    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    session = get_refresh_session_by_jti(db, token_jti)
    if session is None or session.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh session not valid")

    access_token = create_access_token(subject)
    rotated_refresh_token = create_refresh_token(subject)
    rotated_payload = jwt.decode(rotated_refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    revoke_refresh_session(db, token_jti)
    user = db.get(User, UUID(subject))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    create_refresh_session(
        db,
        user=user,
        token_jti=rotated_payload["jti"],
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    apply_auth_cookies(response, access_token, rotated_refresh_token)
    return Token(access_token=access_token)


@router.get("/csrf")
def get_csrf_token(csrf_token: str | None = Cookie(default=None, alias=settings.csrf_cookie_name)) -> dict[str, str]:
    return {"csrf_token": csrf_token or ""}
