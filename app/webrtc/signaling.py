from uuid import UUID

from aiortc import RTCSessionDescription

from app.webrtc.connection_manager import ConnectionManager


class SignalingHandler:

    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager

    async def receive_offer(
        self,
        interview_id: UUID,
        sdp: str,
        sdp_type: str,
    ) -> None:

        # 1. Create or retrieve the peer connection
        peer_connection = await self.connection_manager.create_connection(interview_id)

        # 2. Convert the received SDP into a session description
        offer = RTCSessionDescription(
            sdp=sdp,
            type=sdp_type,
        )

        # 3. Apply the browser's offer
        await peer_connection.setRemoteDescription(offer)

    async def create_answer(self, interview_id: UUID) -> dict:
        peer_connection = self.connection_manager.get_connection(interview_id)

        if peer_connection is None:
            raise ValueError("WebRTC connection not found.")

        print("[SERVER] Creating SDP answer")

        print(
            "[SERVER] Transceivers before answer:",
            [
                (t.kind, t.direction, t.currentDirection)
                for t in peer_connection.getTransceivers()
            ],
        )

        answer = await peer_connection.createAnswer()

        await peer_connection.setLocalDescription(answer)
        print("[SERVER] Peer connection state:", peer_connection.connectionState)

        print(
            "[SERVER] Outgoing senders:",
            [
                {
                    "track_kind": sender.track.kind if sender.track else None,
                    "track_state": sender.track.readyState if sender.track else None,
                }
                for sender in peer_connection.getSenders()
            ],
        )

        print(
            "[SERVER] Transceiver states:",
            [
                {
                    "kind": transceiver.kind,
                    "direction": transceiver.direction,
                    "current_direction": transceiver.currentDirection,
                }
                for transceiver in peer_connection.getTransceivers()
            ],
        )

        print("[SERVER] SDP answer created")

        print(
            "[SERVER] Transceivers after answer:",
            [
                (t.kind, t.direction, t.currentDirection)
                for t in peer_connection.getTransceivers()
            ],
        )

        return {
            "sdp": peer_connection.localDescription.sdp,
            "type": peer_connection.localDescription.type,
        }