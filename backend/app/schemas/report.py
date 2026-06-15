from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    reported_id: UUID
    reason: str


class ReportRead(BaseModel):
    id: UUID
    reporter_id: UUID
    reported_id: UUID
    reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
