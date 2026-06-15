"""Add profile age_group column."""

from alembic import op
import sqlalchemy as sa


revision = "20260426_000005"
down_revision = "20260426_000004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("age_group", sa.Text(), nullable=True))
    op.execute(
        """
        UPDATE profiles
        SET age_group = CASE
            WHEN age BETWEEN 18 AND 24 THEN '18_24'
            WHEN age BETWEEN 25 AND 29 THEN '25_29'
            WHEN age BETWEEN 30 AND 34 THEN '30_34'
            WHEN age BETWEEN 35 AND 39 THEN '35_39'
            WHEN age BETWEEN 40 AND 44 THEN '40_44'
            ELSE '45_plus'
        END
        """
    )
    op.alter_column("profiles", "age_group", nullable=False)
    op.create_index("idx_profiles_age_group", "profiles", ["age_group"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_profiles_age_group", table_name="profiles")
    op.drop_column("profiles", "age_group")
