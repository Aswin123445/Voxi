from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession


from app.ai_pipeline.evalution.answer_evaluator import AnswerEvaluator
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.evaluation_repository import EvaluationRepository
from app.repositories.interview_repository import InterviewRepository
from app.ai_pipeline.evalution.evaluation_schema import EvaluationInput

class EvaluationService:

    def __init__(
        self,
        db: AsyncSession,
        answer_evaluator: AnswerEvaluator,
    ):
        self.db = db
        self.answer_evaluator = answer_evaluator

        self.evaluation_repository = EvaluationRepository(db)
        self.interview_repository = InterviewRepository(db)
        self.conversation_repository = ConversationRepository(db)

    async def create_evaluation(self, turn_id: UUID):

        # Check existing evaluation
        existing = await self.evaluation_repository.get_by_turn_id(turn_id)

        if existing is not None:
            return existing

        try:
            evaluation = await self.evaluation_repository.create_evaluation(
                turn_id=turn_id,
            )

            await self.db.commit()
            await self.db.refresh(evaluation)

            return evaluation

        except IntegrityError:
            await self.db.rollback()

            # Another request may have created it concurrently
            existing = await self.evaluation_repository.get_by_turn_id(turn_id)

            if existing is not None:
                return existing

            raise

        except Exception:
            await self.db.rollback()
            raise

    async def get_evaluation_by_turn(
        self,
        turn_id: UUID,
    ):

        evaluation = await self.evaluation_repository.get_by_turn_id(turn_id)

        if evaluation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluation not found",
            )

        return evaluation

    async def update_evaluation(
        self,
        turn_id: UUID,
        score: float,
        findings: list[dict],
        summary: str,
        evaluation_status: str,
    ):

        evaluation = await self.get_evaluation_by_turn(turn_id)

        updated = await self.evaluation_repository.update_evaluation(
            evaluation=evaluation,
            score=score,
            findings=findings,
            summary=summary,
            status=evaluation_status,
        )

        await self.db.commit()
        await self.db.refresh(updated)

        return updated

    async def prepare_evaluation_input(
        self,
        interview_id: UUID,
        turn_id: UUID,
    ) -> EvaluationInput:

        # 1. Retrieve interview
        interview = await self.interview_repository.get_by_id(interview_id)

        if interview is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        # 2. Retrieve conversation turn
        turn = await self.conversation_repository.get_turn_by_id(turn_id)

        if turn is None or turn.interview_id != interview_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation turn not found",
            )

        # 3. Validate candidate answer
        if not turn.candidate_answer or not turn.candidate_answer.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Candidate answer is empty",
            )

        # 4. Prepare evaluation input
        return EvaluationInput(
            job_role=interview.job_role,
            experience_level=interview.experience_level,
            stage=turn.stage,
            question=turn.question,
            answer=turn.candidate_answer,
        )

    async def evaluate_answer(
        self,
        interview_id: UUID,
        turn_id: UUID,
    ):

        # 1. Prepare evaluation input
        evaluation_input = await self.prepare_evaluation_input(
            interview_id=interview_id,
            turn_id=turn_id,
        )

        # 2. Create or retrieve evaluation
        evaluation = await self.create_evaluation(turn_id)

        # 3. Avoid re-evaluating completed records
        if evaluation.status == "COMPLETED":
            return evaluation

        try:
            # 4. Mark evaluation as processing
            evaluation.status = "PROCESSING"
            await self.db.commit()

            # 5. Execute AI evaluation
            result = await self.answer_evaluator.evaluate(evaluation_input)

            # 6. Convert findings into JSON-compatible data
            findings = [finding.model_dump() for finding in result.findings]

            # 7. Persist evaluation result
            return await self.update_evaluation(
                turn_id=turn_id,
                score=result.score,
                findings=findings,
                summary=result.summary,
                evaluation_status="COMPLETED",
            )

        except Exception:
            # Roll back any unfinished transaction
            await self.db.rollback()

            # Mark evaluation as failed
            try:
                evaluation = await self.evaluation_repository.get_by_turn_id(turn_id)

                if evaluation is not None:
                    evaluation.status = "FAILED"
                    await self.db.commit()

            except Exception:
                await self.db.rollback()
                # Preserve the original evaluation exception.

            raise
