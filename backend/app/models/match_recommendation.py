import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MatchRecommendation(Base):
    __tablename__ = "match_recommendations"
    __table_args__ = (
        UniqueConstraint("user_id", "candidate_user_id", name="uq_match_recommendations_pair"),
        CheckConstraint("user_id <> candidate_user_id", name="chk_match_recommendations_different_users"),
        CheckConstraint(
            "status IN ('pending', 'accepted', 'dismissed')",
            name="chk_match_recommendations_status",
        ),
        CheckConstraint(
            "generated_by IN ('rule_based', 'ai_draft')",
            name="chk_match_recommendations_generated_by",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    generated_by: Mapped[str] = mapped_column(String, nullable=False, default="rule_based")
    last_notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
