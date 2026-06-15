from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.inquiry import Inquiry
from app.schemas.inquiry import InquiryCreate, InquiryCreateResult


router = APIRouter()


@router.post("/", response_model=InquiryCreateResult, status_code=201)
def create_inquiry(
    payload: InquiryCreate,
    db: Session = Depends(get_db),
) -> InquiryCreateResult:
    inquiry = Inquiry(
        name=payload.name,
        email=str(payload.email),
        message=payload.message,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return InquiryCreateResult(id=inquiry.id, message="문의가 접수되었습니다.")
