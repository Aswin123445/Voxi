from app.enums.interview_stage import InterviewStage
from app.enums.interview_status import InterviewStatus
from app.exceptions.interview import InterviewNotFoundException, InvalidInterviewStatusException
from app.repositories.interview_repository import InterviewRepository
from app.schemas.interview import InterviewCreate
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime, timezone

class InterviewService:

    def __init__(self, db: AsyncSession):
        self.repository = InterviewRepository(db)
        self.db = db

    async def create_interview(self, data: InterviewCreate):
        try:
            interview_data = data.model_dump()

            interview_data["current_stage"] = InterviewStage.INTRODUCTION.value

            interview = await self.repository.create(interview_data)

            await self.db.commit()
            await self.db.refresh(interview)

            return interview

        except Exception:
            await self.db.rollback()
            raise

    async def get_interview(self, interview_id: UUID):

        interview = await self.repository.get_by_id(interview_id)

        if interview is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        return interview

    async def start_interview(self, interview_id: UUID):

        try:
            interview = await self.repository.get_by_id(interview_id)

            if not interview:
                raise InterviewNotFoundException()

            if interview.status == InterviewStatus.IN_PROGRESS:
                return interview

            if interview.status != InterviewStatus.CREATED:
                raise InvalidInterviewStatusException()

            interview.status = InterviewStatus.IN_PROGRESS
            interview.current_stage = InterviewStage.INTRODUCTION
            interview.started_at = datetime.now(timezone.utc)

            await self.repository.update(interview)

            await self.db.commit()
            await self.db.refresh(interview)

            return interview

        except Exception:
            await self.db.rollback()
            raise

    async def update_current_stage(
        self,
        interview_id: UUID,
        next_stage: InterviewStage,
    ):

        try:
            interview = await self.repository.get_by_id(interview_id)

            if not interview:
                raise InterviewNotFoundException()

            if interview.status != InterviewStatus.IN_PROGRESS:
                raise InvalidInterviewStatusException()

            interview.current_stage = next_stage.value

            await self.repository.update(interview)

            await self.db.commit()
            await self.db.refresh(interview)

            return interview

        except Exception:
            await self.db.rollback()
            raise


    async def complete_interview(self, interview_id: UUID):
    
        try:
            interview = await self.repository.get_by_id(interview_id)
    
            if not interview:
                raise InterviewNotFoundException()
    
            if interview.status != InterviewStatus.IN_PROGRESS.value:
                raise InvalidInterviewStatusException()
    
            interview.status = InterviewStatus.COMPLETED.value
            interview.ended_at = datetime.now(timezone.utc)
    
            await self.repository.update(interview)
    
            await self.db.commit()
            await self.db.refresh(interview)
    
            return interview
    
        except Exception:
            await self.db.rollback()
            raise
        