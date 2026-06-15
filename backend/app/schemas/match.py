from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.profile import PublicProfileRead
from app.schemas.user import UserRead


class MatchCreate(BaseModel):
    user1_id: UUID
    user2_id: UUID
    score: float


class MatchRead(BaseModel):
    id: UUID
    user1_id: UUID
    user2_id: UUID
    score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MatchRecommendationRead(BaseModel):
    id: UUID
    user_id: UUID
    candidate_user_id: UUID
    score: float
    status: str
    rationale: str
    generated_by: str
    last_notified_at: datetime | None
    created_at: datetime
    updated_at: datetime
    candidate: UserRead
    candidate_profile: PublicProfileRead
