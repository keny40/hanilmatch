"""Add Google OAuth fields
Revision ID: 20260426_000015
Revises: 20260426_000014
Create Date: 2026-06-12 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "20260426_000015"
down_revision = "20260426_000014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("auth_provider", sa.String(), nullable=False, server_default="email"))
    op.add_column("users", sa.Column("google_id", sa.String(), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index("ix_users_google_id_unique", "users", ["google_id"], unique=True, postgresql_where=sa.text("google_id IS NOT NULL"))


def downgrade() -> None:
    op.drop_index("ix_users_google_id_unique", table_name="users")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "google_id")
    op.drop_column("users", "auth_provider")
