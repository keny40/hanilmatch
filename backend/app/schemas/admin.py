from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserRead
from app.schemas.inquiry import InquiryRead


class AdminUserUpdate(BaseModel):
    is_verified: bool | None = None
    is_admin: bool | None = None
    membership_tier: str | None = None


class AdminSettingsRead(BaseModel):
    match_notification_limit: int
    paid_membership_price_usd: float
    billing_currency: str = "USD"


class AdminSettingsUpdate(BaseModel):
    match_notification_limit: int = Field(ge=0, le=100)
    paid_membership_price_usd: float = Field(gt=0)


class AdminRecommendationRunRequest(BaseModel):
    limit: int | None = Field(default=None, ge=1, le=1000)


class AdminRecommendationRunResult(BaseModel):
    processed_users: int
    connected_matches: int = 0
    skipped_incomplete_profiles: int = 0
    message: str


class AdminUserRecommendationRunResult(BaseModel):
    user_id: UUID
    created_count: int
    connected_matches: int = 0
    skipped_incomplete_profiles: int = 0
    message: str


class AdminDailyAutoMatchingResult(BaseModel):
    processed_users: int
    connected_matches: int
    skipped_already_matched_today: int
    skipped_no_candidates: int
    skipped_incomplete_profiles: int
    message: str


class BroadcastNotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=2000)


class PopupNoticeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=2000)
    locale: str = "all"
    is_active: bool = True


class PopupNoticeUpdate(BaseModel):
    is_active: bool


class PopupNoticeRead(BaseModel):
    id: UUID
    title: str
    body: str
    locale: str
    is_active: bool
    starts_at: datetime | None
    ends_at: datetime | None
    created_by: UUID | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserRead(UserRead):
    pass


class AdminReportRead(BaseModel):
    id: UUID
    reporter_id: UUID
    reporter_email: str
    reported_id: UUID
    reported_email: str
    reason: str
    status: str
    processed_by: UUID | None = None
    processed_at: datetime | None = None
    created_at: datetime


class AdminReportUpdate(BaseModel):
    status: str


class AdminInquiryRead(InquiryRead):
    pass


class AdminInquiryStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=30)


class AdminInquiryUpdate(BaseModel):
    status: str | None = Field(default=None, min_length=1, max_length=30)
    admin_note: str | None = None
