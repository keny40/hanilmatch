import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, foreign, mapped_column, relationship

from app.db.base import Base
from app.models.profile_photo import ProfilePhoto


class Profile(Base):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    age_group: Mapped[str] = mapped_column(String, nullable=False, index=True)
    occupation: Mapped[str | None] = mapped_column(String(120), nullable=True)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    native_language: Mapped[str | None] = mapped_column(String(60), nullable=True)
    learning_language: Mapped[str | None] = mapped_column(String(60), nullable=True)
    language_level: Mapped[str | None] = mapped_column(String(60), nullable=True)
    match_purpose: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(60), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    interests: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)

    user: Mapped["User"] = relationship(back_populates="profile")
    photos: Mapped[list["ProfilePhoto"]] = relationship(
        "ProfilePhoto",
        primaryjoin=lambda: Profile.user_id == foreign(ProfilePhoto.user_id),
        order_by="ProfilePhoto.display_order.asc()",
        viewonly=True,
    )
