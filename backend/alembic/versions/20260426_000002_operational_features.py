"""Add profile photos and translation metadata."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260426_000002"
down_revision = "20260426_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "profile_photos",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_url", sa.Text(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_profile_photos_user_id", "profile_photos", ["user_id", "display_order"], unique=False)

    op.add_column("messages", sa.Column("translation_status", sa.Text(), nullable=False, server_default="pending"))
    op.add_column("messages", sa.Column("translated_at", sa.TIMESTAMP(timezone=True), nullable=True))
    op.create_index("idx_messages_translation_status", "messages", ["translation_status", "created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_messages_translation_status", table_name="messages")
    op.drop_column("messages", "translated_at")
    op.drop_column("messages", "translation_status")

    op.drop_index("idx_profile_photos_user_id", table_name="profile_photos")
    op.drop_table("profile_photos")
