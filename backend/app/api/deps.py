from collections.abc import Generator
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud.user import get_user_by_id
from app.models.user import User
from app.db.session import SessionLocal


oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login", auto_error=False)
fixed_admin_email = "keny4000@gmail.com"


def is_admin_user(user: User) -> bool:
    return user.email.lower() == fixed_admin_email


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    access_token = token or request.cookies.get(settings.auth_cookie_name)
    if access_token is None:
        raise credentials_error
    try:
        payload = jwt.decode(access_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise credentials_error
        user_id = UUID(subject)
    except (jwt.InvalidTokenError, ValueError):
        raise credentials_error

    user = get_user_by_id(db, user_id)
    if user is None:
        raise credentials_error
    return user


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not is_admin_user(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="관리자 권한이 없습니다.")
    return current_user
