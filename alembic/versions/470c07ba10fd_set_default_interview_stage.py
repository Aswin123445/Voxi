"""set default interview stage

Revision ID: 470c07ba10fd
Revises: eef65a2a1e28
Create Date: 2026-11-09 20:34:30.806212
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "470c07ba10fd"
down_revision: Union[str, Sequence[str], None] = "eef65a2a1e28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update existing NULL values first
    op.execute("""
        UPDATE interviews
        SET current_stage = 'INTRODUCTION'
        WHERE current_stage IS NULL
        """)

    # Prevent NULL values in future records
    op.alter_column(
        "interviews",
        "current_stage",
        existing_type=sa.String(length=50),
        nullable=False,
    )


def downgrade() -> None:
    # Allow NULL values again
    op.alter_column(
        "interviews",
        "current_stage",
        existing_type=sa.String(length=50),
        nullable=True,
    )
