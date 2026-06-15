"""Add inquiry admin note
Revision ID: 20260426_000014
Revises: 20260426_000013
Create Date: 2026-06-11 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "20260426_000014"
down_revision = "20260426_000013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("inquiries", sa.Column("admin_note", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("inquiries", "admin_note")
