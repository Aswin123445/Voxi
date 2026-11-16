from fastapi import APIRouter
from app.api.v1.endpoints import interviews,evaluations

api_router = APIRouter()

api_router.include_router(
    interviews.router,
    prefix="/interviews",
    tags=["Interviews"],
)
api_router.include_router(
    evaluations.router,
    prefix="/interviews",
    tags=["Evaluations"],
)
