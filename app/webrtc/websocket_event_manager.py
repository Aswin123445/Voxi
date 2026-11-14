import logging
from uuid import UUID

from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect

logger = logging.getLogger(__name__)


class WebSocketEventManager:

    def __init__(self):
        self.connections: dict[UUID, WebSocket] = {}

    async def connect(
        self,
        interview_id: UUID,
        websocket: WebSocket,
    ) -> None:
        self.connections[interview_id] = websocket

        logger.info(
            "[WS] Client connected. Interview: %s",
            interview_id,
        )

    async def disconnect(self, interview_id: UUID) -> None:
        self.connections.pop(interview_id, None)

        logger.info(
            "[WS] Client disconnected. Interview: %s",
            interview_id,
        )

    async def send_event(
        self,
        interview_id: UUID,
        event: str,
        data: dict | None = None,
    ) -> bool:

        websocket = self.connections.get(interview_id)

        if websocket is None:
            logger.warning(
                "[WS] No active WebSocket for interview: %s",
                interview_id,
            )
            return False

        try:
            await websocket.send_json(
                {
                    "event": event,
                    "interview_id": str(interview_id),
                    "data": data or {},
                }
            )

            return True

        except (WebSocketDisconnect, RuntimeError):
            logger.exception(
                "[WS] Failed to send event %s for interview %s",
                event,
                interview_id,
            )
            return False
