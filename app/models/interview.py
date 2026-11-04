import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    DateTime,
    Index,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

class Interview(Base):
    __tablename__ = "interviews"

    # Primary key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )

    # Candidate information
    candidate_name: Mapped[str] = mapped_column(String(150), nullable=False)

    candidate_email: Mapped[str] = mapped_column(String(255), nullable=False)

    # Interview configuration
    job_role: Mapped[str] = mapped_column(String(150), nullable=False)

    experience_level: Mapped[str] = mapped_column(String(30), nullable=False)

    # Interview state
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default=text("'CREATED'")
    )

    current_stage: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Interview timestamps
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Audit timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Indexes
    __table_args__ = (
        Index("ix_interviews_candidate_email", "candidate_email"),
        Index("ix_interviews_status", "status"),
    )
