from datetime import datetime

from sqlalchemy import DateTime, Integer, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AdminSetting(Base):
    __tablename__ = "admin_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    match_notification_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")
    paid_membership_price_usd: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=9.99, server_default="9.99")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
