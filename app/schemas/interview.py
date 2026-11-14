from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal
from datetime import datetime
from uuid import UUID

ExperienceLevel = Literal[
    "FRESHER",
    "JUNIOR",
    "MID_LEVEL",
    "SENIOR",
]
class InterviewCreate(BaseModel):
    candidate_name: str = Field(min_length=2, max_length=150)
    candidate_email: EmailStr

    job_role: str = Field(min_length=2, max_length=150)
    experience_level: ExperienceLevel


class InterviewResponse(BaseModel):
    id: UUID

    candidate_name: str
    candidate_email: str
    job_role: str
    experience_level: str

    status: str
    current_stage: str | None

    started_at: datetime | None
    ended_at: datetime | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewStartResponse(BaseModel):
    id: UUID
    status: str
    current_stage: str | None
    started_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
