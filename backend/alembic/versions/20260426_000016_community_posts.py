"""Add moderated community posts
Revision ID: 20260426_000016
Revises: 20260426_000015
Create Date: 2026-06-13 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260426_000016"
down_revision = "20260426_000015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "community_posts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("author_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "category IN ('notice', 'review', 'culture', 'tips', 'feedback')",
            name="chk_community_posts_category",
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'hidden')",
            name="chk_community_posts_status",
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_community_posts_author_id", "community_posts", ["author_id"])
    op.create_index("ix_community_posts_category", "community_posts", ["category"])
    op.create_index("ix_community_posts_status", "community_posts", ["status"])
    op.create_index("ix_community_posts_is_public", "community_posts", ["is_public"])


def downgrade() -> None:
    op.drop_index("ix_community_posts_is_public", table_name="community_posts")
    op.drop_index("ix_community_posts_status", table_name="community_posts")
    op.drop_index("ix_community_posts_category", table_name="community_posts")
    op.drop_index("ix_community_posts_author_id", table_name="community_posts")
    op.drop_table("community_posts")
