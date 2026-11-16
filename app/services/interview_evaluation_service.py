from uuid import UUID
from app.services.interview_service import InterviewService
from app.enums.interview_status import InterviewStatus
from fastapi import HTTPException, status
from app.repositories.interview_evaluation_repository import (
    InterviewEvaluationRepository,
)


class InterviewEvaluationService:

    def __init__(
        self,
        db,
        interview_evaluator = None,
    ):
        self.db = db
        self.interview_evaluator = interview_evaluator

        self.repository = InterviewEvaluationRepository(db)

    async def evaluate_interview(self, interview_id: UUID):

        # 1. Fetch all completed conversation turns
        turns = await self.repository.get_completed_turns(
            interview_id=interview_id,
        )

        # 2. Validate conversation completeness
        self._validate_turns(turns)

        # 3. Prepare interview data
        conversation_data = self._prepare_evaluation_data(turns)

        interview_data = {
            "interview_id": str(interview_id),
            "conversation": conversation_data,
        }

        # 4. Generate final interview assessment using LLM
        final_assessment = await self.interview_evaluator.evaluate(
            interview_data=interview_data
        )

        # 5. Persist final interview evaluation
        final_evaluation = await self.repository.create(
            interview_id=interview_id,
            overall_score=final_assessment.overall_score,
            recommendation=final_assessment.recommendation,
            evaluation_data=final_assessment.model_dump(),
            status="COMPLETED",
        )

        await self.db.commit()

        # 6. Return final evaluation
        return final_evaluation


    async def get_interview_results(self, interview_id: UUID):

        # 1. Verify that the interview exists.
        interview_service = InterviewService(self.db)

        interview = await interview_service.get_interview(
            interview_id=interview_id,
        )

        # 2. Ensure the interview is completed.
        interview_status = getattr(interview.status, "value", interview.status)

        if interview_status != InterviewStatus.COMPLETED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Interview has not been completed yet.",
            )

        # 3. Retrieve the persisted evaluation.
        evaluation = await self.repository.get_by_interview_id(
            interview_id=interview_id,
        )

        if evaluation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview evaluation not found.",
            )

        # 4. Verify evaluation completion.
        if evaluation.status != "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Interview evaluation is not ready yet.",
            )

        return evaluation

    def _validate_turns(self, turns):

        if not turns:
            raise ValueError("No completed conversation turns found.")

        for turn in turns:
            if not turn.candidate_answer or not turn.candidate_answer.strip():
                raise ValueError(f"Missing candidate answer for stage: {turn.stage}")

    def _prepare_evaluation_data(self, turns):

        conversation = []

        for turn in turns:
            conversation.append(
                {
                    "stage": turn.stage,
                    "question": turn.question,
                    "candidate_answer": turn.candidate_answer,
                }
            )

        return conversation
