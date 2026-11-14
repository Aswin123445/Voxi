from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview import Interview


class InterviewRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> Interview:

        interview = Interview(**data)

        self.db.add(interview)

        await self.db.flush()

        return interview

    async def get_by_id(
        self,
        interview_id: UUID,
    ) -> Interview | None:

        result = await self.db.execute(
            select(Interview).where(Interview.id == interview_id)
        )

        return result.scalar_one_or_none()

    async def update(
        self,
        interview: Interview,
    ) -> Interview:

        self.db.add(interview)

        await self.db.flush()

        return interview
