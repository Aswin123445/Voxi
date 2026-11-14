"""create interview evaluations

Revision ID: 3ff777ad5189
Revises: 470c07ba10fd
Create Date: 2026-11-10 10:52:32.946123
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "3ff777ad5189"
down_revision: Union[str, Sequence[str], None] = "470c07ba10fd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interview_evaluations",

        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),

        sa.Column(
            "interview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("interviews.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),

        sa.Column(
            "overall_score",
            sa.Numeric(5, 2),
            nullable=True,
        ),

        sa.Column(
            "recommendation",
            sa.String(length=30),
            nullable=True,
        ),

        sa.Column(
            "evaluation_data",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),

        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="PENDING",
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS interview_evaluations CASCADE
        """
    )