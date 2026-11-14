from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation_turn import ConversationTurn


class ConversationRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_turn(
        self,
        interview_id: UUID,
        stage: str,
        question: str,
        turn_number: int,
    ) -> ConversationTurn:

        turn = ConversationTurn(
            interview_id=interview_id,
            stage=stage,
            question=question,
            turn_number=turn_number,
        )

        self.db.add(turn)
        await self.db.flush()
        await self.db.refresh(turn)

        return turn

    async def get_turn_by_id(
        self,
        turn_id: UUID,
    ) -> ConversationTurn | None:

        query = select(ConversationTurn).where(ConversationTurn.id == turn_id)

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def update_answer(
        self,
        turn: ConversationTurn,
        answer: str,
    ) -> ConversationTurn:

        turn.candidate_answer = answer
        turn.status = "ANSWERED"

        await self.db.flush()
        await self.db.refresh(turn)

        return turn

    async def get_turns_by_interview(
        self,
        interview_id: UUID,
    ) -> list[ConversationTurn]:

        query = (
            select(ConversationTurn)
            .where(ConversationTurn.interview_id == interview_id)
            .order_by(ConversationTurn.turn_number.asc())
        )

        result = await self.db.execute(query)

        return list(result.scalars().all())

    async def get_by_stage(
        self,
        interview_id: UUID,
        stage: str,
    ):
        stmt = select(ConversationTurn).where(
            ConversationTurn.interview_id == interview_id,
            ConversationTurn.stage == stage,
        )

        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()


    async def get_active_turn(
        self,
        interview_id: UUID,
    ) -> ConversationTurn | None:
    
        stmt = (
            select(ConversationTurn)
            .where(
                ConversationTurn.interview_id == interview_id,
                ConversationTurn.status == "PENDING",
            )
            .order_by(ConversationTurn.turn_number.asc())
            .limit(1)
        )
    
        result = await self.db.execute(stmt)
    
        return result.scalar_one_or_none()
