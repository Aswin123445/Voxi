from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class InterviewEvaluationResult(BaseModel):

    model_config = ConfigDict(extra="forbid")

    overall_score: float = Field(ge=0, le=100)

    recommendation: Literal[
        "STRONG_HIRE",
        "HIRE",
        "BORDERLINE",
        "NO_HIRE",
    ]

    technical_assessment: str
    communication_assessment: str
    experience_assessment: str
    problem_solving_assessment: str

    strengths: list[str]
    weaknesses: list[str]
    summary: str
