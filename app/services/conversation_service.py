from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.enums.interview_stage import InterviewStage
from app.models.conversation_turn import ConversationTurn
from app.repositories.interview_repository import InterviewRepository
from app.repositories.conversation_repository import ConversationRepository


class ConversationService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.interview_repository = InterviewRepository(db)
        self.conversation_repository = ConversationRepository(db)

    async def create_turn(
        self,
        interview_id: UUID,
        stage: str,
        question: str,
        turn_number: int,
    ):

        # Validate stage
        try:
            stage = InterviewStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid interview stage: {stage}",
            )

        # Validate question
        if not question.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty",
            )

        if turn_number < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Turn number must be greater than zero",
            )

        # Check whether interview exists
        interview = await self.interview_repository.get_by_id(interview_id)

        if interview is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        try:
            turn = await self.conversation_repository.create_turn(
                interview_id=interview_id,
                stage=stage.value,
                question=question,
                turn_number=turn_number,
            )

            await self.db.commit()
            await self.db.refresh(turn)

            return turn

        except IntegrityError:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A turn already exists for this interview stage or turn number",
            )

        except Exception:
            await self.db.rollback()
            raise

    async def get_turn_by_id(self, turn_id: UUID):

        turn = await self.conversation_repository.get_turn_by_id(turn_id)

        if turn is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation turn not found",
            )

        return turn

    async def get_turn_by_stage(
        self,
        interview_id: UUID,
        stage: str,
    ):
        try:
            stage = InterviewStage(stage)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid interview stage: {stage}",
            )

        interview = await self.interview_repository.get_by_id(interview_id)

        if interview is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        return await self.conversation_repository.get_by_stage(
            interview_id=interview_id,
            stage=stage.value,
        )

    async def update_answer(
        self,
        turn_id: UUID,
        answer: str,
    ):

        if not answer or not answer.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Candidate answer cannot be empty",
            )

        turn = await self.conversation_repository.get_turn_by_id(turn_id)

        if turn is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation turn not found",
            )

        if turn.status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This turn has already been answered or processed",
            )

        try:
            updated_turn = await self.conversation_repository.update_answer(
                turn=turn,
                answer=answer.strip(),
            )

            await self.db.commit()
            await self.db.refresh(updated_turn)

            return updated_turn

        except Exception:
            await self.db.rollback()
            raise

    async def get_turns_by_interview(self, interview_id: UUID):

        interview = await self.interview_repository.get_by_id(interview_id)

        if interview is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        return await self.conversation_repository.get_turns_by_interview(interview_id)

    async def get_active_turn(
        self,
        interview_id: UUID,
    ):
        interview = await self.interview_repository.get_by_id(interview_id)

        if interview is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        turn = await self.conversation_repository.get_active_turn(interview_id)

        return turn

    async def update_turn_status(
        self,
        turn_id: UUID,
        new_status: str,
    ):
        turn = await self.conversation_repository.get_turn_by_id(turn_id)

        if turn is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation turn not found",
            )

        turn.status = new_status

        try:
            await self.db.commit()
            await self.db.refresh(turn)
            return turn

        except Exception:
            await self.db.rollback()
            raise


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
