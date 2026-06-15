from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RefreshSessionRead(BaseModel):
    id: UUID
    user_id: UUID
    token_jti: str
    issued_at: datetime
    expires_at: datetime
    revoked_at: datetime | None
    user_agent: str | None
    ip_address: str | None

    model_config = ConfigDict(from_attributes=True)
