from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.refresh_session import RefreshSessionRead
from app.services.refresh_sessions import list_user_refresh_sessions, revoke_refresh_session_by_id


router = APIRouter()


@router.get("/me", response_model=list[RefreshSessionRead])
def list_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RefreshSessionRead]:
    return [RefreshSessionRead.model_validate(session) for session in list_user_refresh_sessions(db, current_user.id)]


@router.delete("/{session_id}", status_code=204)
def revoke_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    revoked = revoke_refresh_session_by_id(db, session_id=session_id, user_id=current_user.id)
    if not revoked:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
