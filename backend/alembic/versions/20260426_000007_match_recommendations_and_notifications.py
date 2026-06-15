"""Add match recommendations and notifications

Revision ID: 20260426_000007
Revises: 20260426_000006
Create Date: 2026-04-26 00:07:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260426_000007"
down_revision = "20260426_000006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "match_recommendations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("candidate_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Numeric(5, 2), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("generated_by", sa.String(), nullable=False, server_default="rule_based"),
        sa.Column("last_notified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["candidate_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "candidate_user_id", name="uq_match_recommendations_pair"),
        sa.CheckConstraint("user_id <> candidate_user_id", name="chk_match_recommendations_different_users"),
        sa.CheckConstraint(
            "status IN ('pending', 'accepted', 'dismissed')",
            name="chk_match_recommendations_status",
        ),
        sa.CheckConstraint(
            "generated_by IN ('rule_based', 'ai_draft')",
            name="chk_match_recommendations_generated_by",
        ),
    )
    op.create_index(
        "idx_match_recommendations_user_id",
        "match_recommendations",
        ["user_id", "status", "score"],
        unique=False,
    )
    op.create_index(
        "idx_match_recommendations_candidate_user_id",
        "match_recommendations",
        ["candidate_user_id"],
        unique=False,
    )

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("notification_type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_notifications_user_id", "notifications", ["user_id", "created_at"], unique=False)
    op.create_index("idx_notifications_type", "notifications", ["notification_type"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_notifications_type", table_name="notifications")
    op.drop_index("idx_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")

    op.drop_index("idx_match_recommendations_candidate_user_id", table_name="match_recommendations")
    op.drop_index("idx_match_recommendations_user_id", table_name="match_recommendations")
    op.drop_table("match_recommendations")
