import uuid
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation_turn import ConversationTurn
from app.models.interview_evaluation import InterviewEvaluation


class InterviewEvaluationRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_completed_turns(
        self,
        interview_id: UUID,
    ):
        stmt = (
            select(ConversationTurn)
            .where(
                ConversationTurn.interview_id == interview_id,
                ConversationTurn.status == "COMPLETED",
            )
            .order_by(ConversationTurn.turn_number)
        )

        result = await self.db.execute(stmt)

        return result.scalars().all()

    async def get_by_interview_id(
        self,
        interview_id: UUID,
    ) -> InterviewEvaluation | None:

        stmt = select(InterviewEvaluation).where(
            InterviewEvaluation.interview_id == interview_id
        )

        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def create(
        self,
        interview_id: UUID,
        overall_score: float | None = None,
        recommendation: str | None = None,
        evaluation_data: dict | None = None,
        status: str = "PENDING",
    ) -> InterviewEvaluation:

        evaluation = InterviewEvaluation(
            interview_id=interview_id,
            overall_score=overall_score,
            recommendation=recommendation,
            evaluation_data=evaluation_data,
            status=status,
        )

        self.db.add(evaluation)

        await self.db.flush()

        return evaluation

    async def update(
        self,
        evaluation: InterviewEvaluation,
        overall_score: float | None = None,
        recommendation: str | None = None,
        evaluation_data: dict | None = None,
        status: str | None = None,
    ) -> InterviewEvaluation:

        if overall_score is not None:
            evaluation.overall_score = overall_score

        if recommendation is not None:
            evaluation.recommendation = recommendation

        if evaluation_data is not None:
            evaluation.evaluation_data = evaluation_data

        if status is not None:
            evaluation.status = status

        await self.db.flush()

        return evaluation
