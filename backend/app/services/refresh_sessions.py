from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.refresh_session import RefreshSession
from app.models.user import User


def create_refresh_session(
    db: Session,
    *,
    user: User,
    token_jti: str,
    user_agent: str | None,
    ip_address: str | None,
) -> RefreshSession:
    now = datetime.now(timezone.utc)
    session = RefreshSession(
        user_id=user.id,
        token_jti=token_jti,
        issued_at=now,
        expires_at=now + timedelta(days=settings.jwt_refresh_token_expire_days),
        user_agent=user_agent,
        ip_address=ip_address,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_refresh_session_by_jti(db: Session, token_jti: str) -> RefreshSession | None:
    statement = select(RefreshSession).where(RefreshSession.token_jti == token_jti)
    return db.scalar(statement)


def revoke_refresh_session(db: Session, token_jti: str) -> None:
    session = get_refresh_session_by_jti(db, token_jti)
    if session is None or session.revoked_at is not None:
        return
    session.revoked_at = datetime.now(timezone.utc)
    db.commit()


def list_user_refresh_sessions(db: Session, user_id: UUID) -> list[RefreshSession]:
    statement = (
        select(RefreshSession)
        .where(RefreshSession.user_id == user_id)
        .order_by(RefreshSession.issued_at.desc())
    )
    return list(db.scalars(statement))


def revoke_refresh_session_by_id(db: Session, *, session_id: UUID, user_id: UUID) -> bool:
    statement = select(RefreshSession).where(
        RefreshSession.id == session_id,
        RefreshSession.user_id == user_id,
    )
    session = db.scalar(statement)
    if session is None or session.revoked_at is not None:
        return False
    session.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return True
