"""Update reports schema for admin processing
Revision ID: 20260426_000010
Revises: 20260426_000009
Create Date: 2026-06-09 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision = "20260426_000010"
down_revision = "20260426_000009"
branch_labels = None
depends_on = None
def upgrade() -> None:
    op.add_column("reports", sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"))
    op.add_column("reports", sa.Column("processed_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("reports", sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key("fk_reports_processed_by", "reports", "users", ["processed_by"], ["id"], ondelete="SET NULL")
    op.create_check_constraint(
        "chk_reports_status",
        "reports",
        "status IN ('pending', 'reviewed', 'dismissed', 'action_taken')"
    )
def downgrade() -> None:
    op.drop_constraint("chk_reports_status", "reports", type_="check")
    op.drop_constraint("fk_reports_processed_by", "reports", type_="foreignkey")
    op.drop_column("reports", "processed_at")
    op.drop_column("reports", "processed_by")
    op.drop_column("reports", "status")
