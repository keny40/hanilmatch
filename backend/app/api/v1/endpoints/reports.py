from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportRead


router = APIRouter()


@router.post("/", response_model=ReportRead, status_code=201)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReportRead:
    if current_user.id == payload.reported_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot report yourself")

    report = Report(
        reporter_id=current_user.id,
        reported_id=payload.reported_id,
        reason=payload.reason,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return ReportRead.model_validate(report)


@router.get("/me", response_model=list[ReportRead])
def list_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ReportRead]:
    statement = select(Report).where(Report.reporter_id == current_user.id).order_by(Report.created_at.desc())
    return [ReportRead.model_validate(report) for report in db.scalars(statement)]
