from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from app.webrtc.connection_manager import ConnectionManager
from app.webrtc.session_coordinator import WebRTCSessionCoordinator
from app.webrtc.signaling import SignalingHandler


def build_webrtc_coordinator(
    app: FastAPI,
) -> WebRTCSessionCoordinator:

    # 1. Retrieve shared ConnectionManager
    connection_manager = app.state.connection_manager

    # 2. Retrieve shared InterviewOrchestrator
    interview_orchestrator = app.state.interview_orchestrator

    # 3. Initialize signaling handler
    signaling_handler = SignalingHandler(connection_manager)

    # 4. Build WebRTC coordinator
    return WebRTCSessionCoordinator(
        signaling_handler=signaling_handler,
        interview_orchestrator=interview_orchestrator,
    )
