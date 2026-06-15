"""Update inquiry statuses
Revision ID: 20260426_000013
Revises: 20260426_000012
Create Date: 2026-06-11 00:00:00
"""
from alembic import op

revision = "20260426_000013"
down_revision = "20260426_000012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS chk_inquiries_status")
    op.execute("ALTER TABLE inquiries ALTER COLUMN status SET DEFAULT 'pending'")
    op.execute("UPDATE inquiries SET status = 'pending' WHERE status = 'new'")
    op.execute("UPDATE inquiries SET status = 'reviewed' WHERE status = 'reviewing'")
    op.execute(
        "ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_status "
        "CHECK (status IN ('pending', 'reviewed', 'replied', 'closed'))"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS chk_inquiries_status")
    op.execute("UPDATE inquiries SET status = 'new' WHERE status = 'pending'")
    op.execute("UPDATE inquiries SET status = 'reviewing' WHERE status IN ('reviewed', 'replied')")
    op.execute("ALTER TABLE inquiries ALTER COLUMN status SET DEFAULT 'new'")
    op.execute(
        "ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_status "
        "CHECK (status IN ('new', 'reviewing', 'closed'))"
    )
