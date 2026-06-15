"""Add inquiries table
Revision ID: 20260426_000012
Revises: 20260426_000011
Create Date: 2026-06-11 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260426_000012"
down_revision = "20260426_000011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "inquiries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_inquiries_email", "inquiries", ["email"])
    op.create_index("ix_inquiries_status", "inquiries", ["status"])
    op.create_check_constraint(
        "chk_inquiries_status",
        "inquiries",
        "status IN ('pending', 'reviewed', 'replied', 'closed')",
    )


def downgrade() -> None:
    op.drop_constraint("chk_inquiries_status", "inquiries", type_="check")
    op.drop_index("ix_inquiries_status", table_name="inquiries")
    op.drop_index("ix_inquiries_email", table_name="inquiries")
    op.drop_table("inquiries")
