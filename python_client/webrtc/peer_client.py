import asyncio
import logging
import json

import websockets

from aiortc import RTCPeerConnection, RTCSessionDescription

from webrtc.microphone_track import MicrophoneTrack
from audio.audio_player import AudioPlayer

logger = logging.getLogger(__name__)


class PeerClient:

    def __init__(
        self,
        interview_id: str,
        signaling_url: str,
        microphone_device_id: int = 1,
    ):
        self.interview_id = interview_id
        self.signaling_url = (
            f"{signaling_url.rstrip('/')}/" f"ws/interviews/{interview_id}/signaling"
        )

        self.pc = RTCPeerConnection()
        self.microphone = MicrophoneTrack(microphone_device_id)

        self.connected = asyncio.Event()
        self.remote_audio_tasks = []

        self._register_events()
        self.audio_player = AudioPlayer()

    def _register_events(self):

        @self.pc.on("connectionstatechange")
        async def on_connection_state_change():
            logger.info(
                "[SERVER] Peer connection state changed: %s",
                self.pc.connectionState,
            )
            state = self.pc.connectionState
            logger.info("[CLIENT] Connection state: %s", state)
            logger.info(
                "[CLIENT] Connection state changed: %s",
                state,
            )
            if state == "connected":
                self.connected.set()

            elif state in ("failed", "closed"):
                self.connected.clear()

        @self.pc.on("iceconnectionstatechange")
        async def on_ice_connection_state_change():
        
            state = self.pc.iceConnectionState

            logger.info("[CLIENT] ICE state changed: %s", state)

            if state == "failed":
                logger.error("[CLIENT] ICE connectivity failed")

            elif state == "disconnected":
                logger.warning("[CLIENT] ICE connectivity temporarily disconnected")

            elif state == "closed":
                logger.warning("[CLIENT] ICE connection closed")

        @self.pc.on("track")
        def on_track(track):
            logger.info(
                "[CLIENT] Received remote track: %s",
                track.kind,
            )

            if track.kind == "audio":
                task = asyncio.create_task(self._consume_remote_audio(track))
                self.remote_audio_tasks.append(task)

    async def monitor_connection(self):
        while self.pc.connectionState != "closed":
            logger.info(
                "[MONITOR] PC=%s | ICE=%s | MIC=%s",
                self.pc.connectionState,
                self.pc.iceConnectionState,
                self.microphone.readyState,
            )

            await asyncio.sleep(5)
    async def _consume_remote_audio(self, track):
        """Receive and play incoming audio from the backend."""

        logger.info("[CLIENT] Starting remote audio playback")

        try:
            await self.audio_player.consume(track)

        except asyncio.CancelledError:
            logger.info("[CLIENT] Remote audio playback cancelled")
            raise

        except Exception:
            logger.exception("[CLIENT] Remote audio playback failed")

    async def connect(self):
        """Establish WebRTC connection with the Voxi backend."""

        # 1. Start physical microphone.
        await self.microphone.start()

        # 2. Add microphone track to peer connection.
        # This creates a bidirectional audio transceiver.
        self.pc.addTrack(self.microphone)

        # 3. Create SDP offer.
        offer = await self.pc.createOffer()

        # 4. Set local description.
        # aiortc gathers ICE candidates during this operation.
        await self.pc.setLocalDescription(offer)

        local_description = self.pc.localDescription

        logger.info("[CLIENT] SDP offer created")

        # 5. Exchange SDP through WebSocket.
        async with websockets.connect(self.signaling_url) as websocket:

            await websocket.send(
                json.dumps(
                    {
                        "event": "offer",
                        "sdp": local_description.sdp,
                        "sdp_type": local_description.type,
                    }
                )
            )

            logger.info("[CLIENT] SDP offer sent")

            response = json.loads(await websocket.recv())

            if response.get("event") == "error":
                raise RuntimeError(response.get("message", "Signaling failed"))

            if response.get("event") != "answer":
                raise RuntimeError(f"Unexpected signaling response: {response}")

            # 6. Apply backend SDP answer.
            answer = RTCSessionDescription(
                sdp=response["sdp"],
                type=response["type"],
            )

            await self.pc.setRemoteDescription(answer)

            logger.info("[CLIENT] SDP answer applied")

        logger.info("[CLIENT] Signaling exchange completed")

    async def wait_until_connected(self, timeout: float = 30):
        """Wait until WebRTC connectivity is established."""

        try:
            await asyncio.wait_for(
                self.connected.wait(),
                timeout=timeout,
            )
        except asyncio.TimeoutError:
            raise TimeoutError(
                "WebRTC connection was not established "
                f"within {timeout} seconds. "
                f"Current state: {self.pc.connectionState}"
            )

    async def close(self):
        """Release microphone and WebRTC resources."""
    
        logger.warning("[CLIENT] PeerClient.close() called")
    
        logger.warning("[CLIENT] Stopping microphone")
        self.microphone.stop()
    
        for task in self.remote_audio_tasks:
            task.cancel()
    
        if self.remote_audio_tasks:
            await asyncio.gather(
                *self.remote_audio_tasks,
                return_exceptions=True,
            )
    
        logger.warning("[CLIENT] Closing peer connection")
        await self.pc.close()
    
        logger.info("[CLIENT] Peer connection closed")