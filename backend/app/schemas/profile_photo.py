from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProfilePhotoRegister(BaseModel):
    file_url: str
    display_order: int = 0


class ProfilePhotoRead(BaseModel):
    id: UUID
    user_id: UUID
    file_url: str
    display_order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
