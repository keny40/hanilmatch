"""Add platform pair constraint to users

Revision ID: 20260426_000006
Revises: 20260426_000005
Create Date: 2026-04-26 00:06:00
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260426_000006"
down_revision = "20260426_000005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "chk_users_platform_pair",
        "users",
        "(nationality = 'KR' AND gender = 'male') OR (nationality = 'JP' AND gender = 'female')",
    )


def downgrade() -> None:
    op.drop_constraint("chk_users_platform_pair", "users", type_="check")
