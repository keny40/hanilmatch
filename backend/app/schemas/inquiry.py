from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class InquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)

    @field_validator("name", "message")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("field must not be empty")
        return normalized


class InquiryRead(BaseModel):
    id: UUID
    name: str
    email: str
    message: str
    status: str
    admin_note: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InquiryCreateResult(BaseModel):
    id: UUID
    message: str


class InquiryStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=30)
