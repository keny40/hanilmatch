from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.crud.user import get_user_by_email
from app.models.user import User
from app.schemas.user import UserCreate


def create_user_account(db: Session, payload: UserCreate) -> User:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email.strip().lower(),
        password_hash=hash_password(payload.password),
        gender=payload.gender,
        nationality=payload.nationality,
        language=payload.language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return user
