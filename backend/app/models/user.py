import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("gender IN ('male', 'female')", name="chk_users_gender"),
        CheckConstraint("nationality IN ('KR', 'JP')", name="chk_users_nationality"),
        CheckConstraint("membership_tier IN ('free', 'paid')", name="chk_users_membership_tier"),
        CheckConstraint(
            "(nationality = 'KR' AND gender = 'male') OR (nationality = 'JP' AND gender = 'female')",
            name="chk_users_platform_pair",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    gender: Mapped[str] = mapped_column(String, nullable=False)
    nationality: Mapped[str] = mapped_column(String, nullable=False, index=True)
    language: Mapped[str] = mapped_column(String, nullable=False)
    auth_provider: Mapped[str] = mapped_column(String, nullable=False, default="email", server_default="email")
    google_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    membership_tier: Mapped[str] = mapped_column(String, default="free", nullable=False, server_default="free")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    profile: Mapped["Profile"] = relationship(back_populates="user", cascade="all, delete-orphan")
    sent_messages: Mapped[list["Message"]] = relationship(
        back_populates="sender",
        foreign_keys="Message.sender_id",
    )
    received_messages: Mapped[list["Message"]] = relationship(
        back_populates="receiver",
        foreign_keys="Message.receiver_id",
    )
    reports_filed: Mapped[list["Report"]] = relationship(
        back_populates="reporter",
        foreign_keys="Report.reporter_id",
    )
    reports_received: Mapped[list["Report"]] = relationship(
        back_populates="reported",
        foreign_keys="Report.reported_id",
    )
    profile_photos: Mapped[list["ProfilePhoto"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    refresh_sessions: Mapped[list["RefreshSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(cascade="all, delete-orphan")
    popup_notices_created: Mapped[list["PopupNotice"]] = relationship(
        back_populates="created_by_user",
        cascade="all, delete-orphan",
        foreign_keys="PopupNotice.created_by",
    )
    outgoing_recommendations: Mapped[list["MatchRecommendation"]] = relationship(
        foreign_keys="MatchRecommendation.user_id",
        cascade="all, delete-orphan",
    )
    incoming_recommendations: Mapped[list["MatchRecommendation"]] = relationship(
        foreign_keys="MatchRecommendation.candidate_user_id",
        cascade="all, delete-orphan",
    )
