"""Add MVP profile fields
Revision ID: 20260426_000011
Revises: 20260426_000010
Create Date: 2026-06-11 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "20260426_000011"
down_revision = "20260426_000010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("occupation", sa.String(length=120), nullable=True))
    op.add_column("profiles", sa.Column("location", sa.String(length=120), nullable=True))
    op.add_column("profiles", sa.Column("native_language", sa.String(length=60), nullable=True))
    op.add_column("profiles", sa.Column("learning_language", sa.String(length=60), nullable=True))
    op.add_column("profiles", sa.Column("language_level", sa.String(length=60), nullable=True))
    op.add_column("profiles", sa.Column("match_purpose", sa.String(length=120), nullable=True))
    op.add_column("profiles", sa.Column("phone_number", sa.String(length=60), nullable=True))


def downgrade() -> None:
    op.drop_column("profiles", "phone_number")
    op.drop_column("profiles", "match_purpose")
    op.drop_column("profiles", "language_level")
    op.drop_column("profiles", "learning_language")
    op.drop_column("profiles", "native_language")
    op.drop_column("profiles", "location")
    op.drop_column("profiles", "occupation")
