from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


COMMUNITY_CATEGORIES = {"notice", "review", "culture", "tips", "feedback"}
USER_WRITABLE_CATEGORIES = {"review", "culture", "feedback"}
COMMUNITY_STATUSES = {"pending", "approved", "rejected", "hidden"}


class CommunityPostCreate(BaseModel):
    category: str = Field(min_length=1, max_length=30)
    title: str = Field(min_length=1, max_length=180)
    content: str = Field(min_length=1, max_length=8000)

    @field_validator("category")
    @classmethod
    def validate_user_category(cls, value: str) -> str:
        normalized = value.strip()
        if normalized not in USER_WRITABLE_CATEGORIES:
            raise ValueError("category is not available for public posting")
        return normalized

    @field_validator("title", "content")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("field must not be empty")
        return normalized


class CommunityPostRead(BaseModel):
    id: UUID
    author_id: UUID
    author_email: str | None = None
    category: str
    title: str
    content: str
    status: str
    is_public: bool
    admin_note: str | None = None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class CommunityPostAdminUpdate(BaseModel):
    status: str | None = Field(default=None, max_length=30)
    admin_note: str | None = Field(default=None, max_length=4000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip()
        if normalized not in COMMUNITY_STATUSES:
            raise ValueError("invalid community post status")
        return normalized

    @field_validator("admin_note")
    @classmethod
    def normalize_admin_note(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return value.strip()
