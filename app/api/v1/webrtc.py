import logging
from uuid import UUID

from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketDisconnect

from app.dependencies.webrtc import build_webrtc_coordinator
from app.webrtc.connection_manager import ConnectionManager
from app.webrtc.websocket_event_manager import WebSocketEventManager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/interviews/{interview_id}/signaling")
async def webrtc_signaling(
    websocket: WebSocket,
    interview_id: UUID,
):
    await websocket.accept()

    connection_manager: ConnectionManager = websocket.app.state.connection_manager

    event_manager: WebSocketEventManager = websocket.app.state.websocket_event_manager

    answer_sent = False

    try:
        await event_manager.connect(
            interview_id=interview_id,
            websocket=websocket,
        )

        # 1. Receive SDP offer
        message = await websocket.receive_json()

        if message.get("event") != "offer":
            await websocket.send_json(
                {
                    "event": "error",
                    "message": "Expected an SDP offer.",
                }
            )
            await websocket.close(code=1008)
            return

        sdp = message.get("sdp")
        sdp_type = message.get("sdp_type")

        if not isinstance(sdp, str) or sdp_type != "offer":
            await websocket.send_json(
                {
                    "event": "error",
                    "message": "Invalid SDP offer.",
                }
            )
            await websocket.close(code=1008)
            return

        # 2. Establish WebRTC session
        coordinator = build_webrtc_coordinator(
            app=websocket.app,
        )

        answer = await coordinator.establish_session(
            interview_id=interview_id,
            sdp=sdp,
            sdp_type=sdp_type,
        )

        # 3. Send SDP answer
        await websocket.send_json(
            {
                "event": "answer",
                **answer,
            }
        )

        logger.info(
            "[SIGNALING] SDP answer sent. Interview: %s",
            interview_id,
        )

        # 4. Keep WebSocket alive for interview events
        while True:
            message = await websocket.receive_json()
        
            client_event = message.get("event")
        
            logger.info(
                "[SIGNALING] Client event received: %s",
                client_event,
            )
        
            if client_event == "ai.playback.started":
            
                await connection_manager.handle_runtime_status(
                    interview_id=interview_id,
                    status="AI_SPEAKING",
                )
        
            elif client_event == "ai.playback.finished":
            
                await connection_manager.handle_runtime_status(
                    interview_id=interview_id,
                    status="LISTENING",
                )
        
            else:
                logger.debug(
                    "[SIGNALING] Unhandled client event: %s",
                    client_event,
                )

    except WebSocketDisconnect as exc:
        logger.info(
            "[WS] Client disconnected. Interview: %s, Code: %s",
            interview_id,
            exc.code,
        )

    except Exception:
        logger.exception(
            "[SIGNALING] WebSocket session failed. Interview: %s",
            interview_id,
        )

        try:
            await websocket.send_json(
                {
                    "event": "error",
                    "message": "Failed to establish or maintain interview connection.",
                }
            )
            await websocket.close(code=1011)
        except Exception:
            pass

    finally:
        await event_manager.disconnect(interview_id)

        # Without reconnect support, close WebRTC when its
        # associated event connection is lost.
        await connection_manager.close_connection(interview_id)
