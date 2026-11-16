from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.ai_pipeline.evalution.interview_evaluation_schema import InterviewEvaluationResult


class InterviewEvaluationResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    interview_id: UUID

    overall_score: float = Field(ge=0, le=100)

    recommendation: Literal[
        "STRONG_HIRE",
        "HIRE",
        "BORDERLINE",
        "NO_HIRE",
    ]

    evaluation_data: InterviewEvaluationResult

    status: Literal["COMPLETED"]

    created_at: datetime
    updated_at: datetime
