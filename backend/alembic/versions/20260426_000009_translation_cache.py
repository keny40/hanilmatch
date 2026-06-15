"""Add translation cache table

Revision ID: 20260426_000009
Revises: 20260426_000008
Create Date: 2026-04-26 00:09:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260426_000009"
down_revision = "20260426_000008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "translation_cache",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cache_key", sa.String(), nullable=False),
        sa.Column("original_text", sa.Text(), nullable=False),
        sa.Column("language_from", sa.String(), nullable=False),
        sa.Column("language_to", sa.String(), nullable=False),
        sa.Column("translated_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("cache_key", name="uq_translation_cache_cache_key"),
    )
    op.create_index("ix_translation_cache_cache_key", "translation_cache", ["cache_key"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_translation_cache_cache_key", table_name="translation_cache")
    op.drop_table("translation_cache")
