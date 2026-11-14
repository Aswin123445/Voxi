from fastapi import APIRouter, Depends, status
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.interview import InterviewCreate, InterviewResponse, InterviewStartResponse
from app.services.interview_service import InterviewService

router = APIRouter()


@router.post("/", response_model=InterviewResponse, status_code=201)
async def create_interview(data: InterviewCreate, db: AsyncSession = Depends(get_db)):
    service = InterviewService(db)

    return await service.create_interview(data) 


@router.get(
    "/{interview_id}",
    response_model=InterviewResponse,
    status_code=status.HTTP_200_OK,
)
async def get_interview(
    interview_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    service = InterviewService(db)

    return await service.get_interview(interview_id) 


@router.post(
    "/{interview_id}/start",
    response_model=InterviewStartResponse,
    status_code=status.HTTP_200_OK,
)
async def start_interview(interview_id: UUID, db: AsyncSession = Depends(get_db)):
    service = InterviewService(db)

    return await service.start_interview(interview_id)
