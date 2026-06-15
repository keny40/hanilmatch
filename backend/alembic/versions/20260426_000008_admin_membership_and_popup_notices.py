"""Add admin, membership, settings, and popup notices

Revision ID: 20260426_000008
Revises: 20260426_000007
Create Date: 2026-04-26 00:08:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260426_000008"
down_revision = "20260426_000007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("users", sa.Column("membership_tier", sa.String(), nullable=False, server_default="free"))
    op.create_check_constraint("chk_users_membership_tier", "users", "membership_tier IN ('free', 'paid')")

    op.create_table(
        "admin_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("match_notification_limit", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("paid_membership_price_usd", sa.Numeric(10, 2), nullable=False, server_default="9.99"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute(
        sa.text(
            "INSERT INTO admin_settings (id, match_notification_limit, paid_membership_price_usd) "
            "VALUES (1, 3, 9.99)"
        )
    )

    op.create_table(
        "popup_notices",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("locale", sa.String(), nullable=False, server_default="all"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("locale IN ('all', 'ko', 'ja')", name="chk_popup_notices_locale"),
    )


def downgrade() -> None:
    op.drop_table("popup_notices")
    op.drop_table("admin_settings")
    op.drop_constraint("chk_users_membership_tier", "users", type_="check")
    op.drop_column("users", "membership_tier")
    op.drop_column("users", "is_admin")
