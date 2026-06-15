from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationRead(BaseModel):
    id: UUID
    user_id: UUID
    notification_type: str
    title: str
    body: str
    payload: dict | None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
