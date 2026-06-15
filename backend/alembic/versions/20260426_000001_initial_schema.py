"""Initial schema with auth-ready users table."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260426_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("gender", sa.Text(), nullable=False),
        sa.Column("nationality", sa.Text(), nullable=False),
        sa.Column("language", sa.Text(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("gender IN ('male', 'female')", name="users_gender_check"),
        sa.CheckConstraint("nationality IN ('KR', 'JP')", name="users_nationality_check"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("idx_users_created_at", "users", ["created_at"], unique=False)
    op.create_index("idx_users_nationality_gender", "users", ["nationality", "gender"], unique=False)

    op.create_table(
        "profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("interests", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.CheckConstraint("age >= 18 AND age <= 120", name="profiles_age_check"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_index("idx_profiles_age", "profiles", ["age"], unique=False)
    op.create_index("idx_profiles_interests", "profiles", ["interests"], unique=False, postgresql_using="gin")

    op.create_table(
        "matches",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user1_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user2_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Numeric(5, 2), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("score >= 0 AND score <= 100", name="matches_score_check"),
        sa.CheckConstraint("user1_id <> user2_id", name="chk_matches_different_users"),
        sa.CheckConstraint("user1_id < user2_id", name="chk_matches_order"),
        sa.ForeignKeyConstraint(["user1_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user2_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user1_id", "user2_id", name="uq_matches_pair"),
    )
    op.create_index("idx_matches_created_at", "matches", ["created_at"], unique=False)
    op.create_index("idx_matches_score", "matches", ["score"], unique=False)
    op.create_index("idx_matches_user1_id", "matches", ["user1_id"], unique=False)
    op.create_index("idx_matches_user2_id", "matches", ["user2_id"], unique=False)

    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sender_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("receiver_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("original_text", sa.Text(), nullable=False),
        sa.Column("translated_text", sa.Text(), nullable=True),
        sa.Column("language_from", sa.Text(), nullable=False),
        sa.Column("language_to", sa.Text(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("sender_id <> receiver_id", name="chk_messages_different_users"),
        sa.ForeignKeyConstraint(["receiver_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_messages_created_at", "messages", ["created_at"], unique=False)
    op.create_index("idx_messages_receiver_id", "messages", ["receiver_id"], unique=False)
    op.create_index("idx_messages_sender_id", "messages", ["sender_id"], unique=False)

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reporter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reported_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("reporter_id <> reported_id", name="chk_reports_different_users"),
        sa.ForeignKeyConstraint(["reported_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reporter_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_reports_created_at", "reports", ["created_at"], unique=False)
    op.create_index("idx_reports_reported_id", "reports", ["reported_id"], unique=False)
    op.create_index("idx_reports_reporter_id", "reports", ["reporter_id"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_reports_reporter_id", table_name="reports")
    op.drop_index("idx_reports_reported_id", table_name="reports")
    op.drop_index("idx_reports_created_at", table_name="reports")
    op.drop_table("reports")

    op.drop_index("idx_messages_sender_id", table_name="messages")
    op.drop_index("idx_messages_receiver_id", table_name="messages")
    op.drop_index("idx_messages_created_at", table_name="messages")
    op.drop_table("messages")

    op.drop_index("idx_matches_user2_id", table_name="matches")
    op.drop_index("idx_matches_user1_id", table_name="matches")
    op.drop_index("idx_matches_score", table_name="matches")
    op.drop_index("idx_matches_created_at", table_name="matches")
    op.drop_table("matches")

    op.drop_index("idx_profiles_interests", table_name="profiles")
    op.drop_index("idx_profiles_age", table_name="profiles")
    op.drop_table("profiles")

    op.drop_index("idx_users_nationality_gender", table_name="users")
    op.drop_index("idx_users_created_at", table_name="users")
    op.drop_table("users")
