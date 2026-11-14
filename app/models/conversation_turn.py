import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class ConversationTurn(Base):
    __tablename__ = "conversation_turns"

    __table_args__ = (
        UniqueConstraint(
            "interview_id",
            "stage",
            name="uq_conversation_turn_interview_stage",
        ),
        UniqueConstraint(
            "interview_id",
            "turn_number",
            name="uq_conversation_turn_interview_number",
        ),
    )

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    interview_id = Column(
        UUID(as_uuid=True),
        ForeignKey("interviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    stage = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    candidate_answer = Column(Text, nullable=True)

    turn_number = Column(Integer, nullable=False)

    status = Column(
        String(30),
        nullable=False,
        default="PENDING",
        server_default="PENDING",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
