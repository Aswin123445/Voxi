from fastapi import APIRouter
from app.api.v1.endpoints import interviews

api_router = APIRouter()

api_router.include_router(
    interviews.router,
    prefix="/interviews",
    tags=["Interviews"],
)
# @api_router.post("/interviews/{interview_id}/test-answer")
# async def test_answer(
#     interview_id: UUID,
#     request: Request,
# ):
#     coordinator = build_webrtc_coordinator(app=request.app)

#     await coordinator.interview_orchestrator.process_answer(
#         interview_id=interview_id,
#         transcript="I have two years of experience working with Python, Django, FastAPI and PostgreSQL. I have developed backend applications and REST APIs.",
#     )

#     return {"message": "Test answer processed successfully"}
