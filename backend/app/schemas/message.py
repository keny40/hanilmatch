from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    receiver_id: UUID
    original_text: str
    language_from: str
    language_to: str


class MessageTranslateRequest(BaseModel):
    target_language: str | None = None


class MessageRead(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    original_text: str
    translated_text: str | None
    translation_status: str
    translated_at: datetime | None
    read_at: datetime | None
    language_from: str
    language_to: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
