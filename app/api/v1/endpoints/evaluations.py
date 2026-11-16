from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.evaluation import InterviewEvaluationResponse
from app.services.interview_evaluation_service import InterviewEvaluationService

router = APIRouter()


@router.get(
    "/{interview_id}/results",
    response_model=InterviewEvaluationResponse,
    status_code=status.HTTP_200_OK,
)
async def get_interview_results(
    interview_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    service = InterviewEvaluationService(db)

    return await service.get_interview_results(interview_id)
