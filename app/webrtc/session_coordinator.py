from app.orchestrator.interview_orchestrator import InterviewOrchestrator
from app.webrtc.signaling import SignalingHandler
from uuid import UUID

class WebRTCSessionCoordinator:

    def __init__(
        self,
        signaling_handler: SignalingHandler,
        interview_orchestrator: InterviewOrchestrator,
    ):
        self.signaling_handler = signaling_handler
        self.interview_orchestrator = interview_orchestrator

    async def establish_session(
        self,
        interview_id: UUID,
        sdp: str,
        sdp_type: str,
    ):

        # 1. Apply browser's SDP offer
        await self.signaling_handler.receive_offer(
            interview_id=interview_id,
            sdp=sdp,
            sdp_type=sdp_type,
        )

        # 2. Generate first question and attach audio track
        await self.interview_orchestrator.start(interview_id)

        # 3. Create SDP answer
        answer = await self.signaling_handler.create_answer(interview_id)

        return answer
