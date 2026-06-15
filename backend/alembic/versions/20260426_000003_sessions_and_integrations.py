"""Add refresh sessions table."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260426_000003"
down_revision = "20260426_000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "refresh_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_jti", sa.String(), nullable=False),
        sa.Column("issued_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("user_agent", sa.String(), nullable=True),
        sa.Column("ip_address", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_jti"),
    )
    op.create_index("idx_refresh_sessions_user_id", "refresh_sessions", ["user_id"], unique=False)
    op.create_index("idx_refresh_sessions_token_jti", "refresh_sessions", ["token_jti"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_refresh_sessions_token_jti", table_name="refresh_sessions")
    op.drop_index("idx_refresh_sessions_user_id", table_name="refresh_sessions")
    op.drop_table("refresh_sessions")
