"""Add message read_at column."""

from alembic import op
import sqlalchemy as sa


revision = "20260426_000004"
down_revision = "20260426_000003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("messages", sa.Column("read_at", sa.TIMESTAMP(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("messages", "read_at")
