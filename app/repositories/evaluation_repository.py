from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.answer_evaluation import AnswerEvaluation


class EvaluationRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_evaluation(
        self,
        turn_id: UUID,
    ) -> AnswerEvaluation:

        evaluation = AnswerEvaluation(
            turn_id=turn_id,
        )

        self.db.add(evaluation)

        await self.db.flush()

        return evaluation

    async def get_by_turn_id(
        self,
        turn_id: UUID,
    ) -> AnswerEvaluation | None:

        stmt = select(AnswerEvaluation).where(AnswerEvaluation.turn_id == turn_id)

        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def update_evaluation(
        self,
        evaluation: AnswerEvaluation,
        score: float,
        findings: list[dict],
        summary: str,
        status: str,
    ) -> AnswerEvaluation:

        evaluation.score = score
        evaluation.findings = findings
        evaluation.summary = summary
        evaluation.status = status

        await self.db.flush()

        return evaluation
