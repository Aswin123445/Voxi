import asyncio
import logging
from uuid import UUID
import traceback
from aiortc import RTCPeerConnection

from app.ai_pipeline.audio.audio_receiver import AudioReceiver
from app.ai_pipeline.audio.stt_service import STTService
from app.orchestrator.interview_orchestrator import InterviewOrchestrator
from app.webrtc.audio_track import GeneratedAudioTrack

logger = logging.getLogger(__name__)


class ConnectionManager:

    def __init__(
        self,
        stt_service: STTService,
    ):
        self.connections: dict[UUID, RTCPeerConnection] = {}
        self.audio_tasks: dict[UUID, asyncio.Task] = {}
        self.audio_receivers: dict[UUID, AudioReceiver] = {}

        self.stt_service = stt_service
        self.interview_orchestrator: InterviewOrchestrator | None = None
        self.outgoing_audio_tracks: dict[UUID, GeneratedAudioTrack] = {}

    # --------------------------------------------------
    # Transcript handling
    # --------------------------------------------------

    def set_interview_orchestrator(
        self,
        orchestrator: InterviewOrchestrator,
    ) -> None:
        self.interview_orchestrator = orchestrator

    async def handle_playback_event(
        self,
        interview_id: UUID,
        event: str,
        batch_id: UUID,
        turn_number: int,
    ) -> None:
        if self.interview_orchestrator is None:
            raise RuntimeError("InterviewOrchestrator is not initialized")
        if event == "ai.playback.started":
            await self.interview_orchestrator.handle_playback_started(
                interview_id=interview_id,
                batch_id=batch_id,
                turn_number=turn_number,
            )

        elif event == "ai.playback.finished":
            await self.interview_orchestrator.handle_playback_finished(
                interview_id=interview_id,
                batch_id=batch_id,
                turn_number=turn_number,
            )
        else:
            logger.warning(
                "[CONNECTION MANAGER] Unsupported playback event: %s",
                event,
            )
    async def handle_transcript(
        self,
        interview_id: UUID,
        transcript: str,
    ):
        if self.interview_orchestrator is None:
            raise RuntimeError("InterviewOrchestrator is not initialized")

        logger.info(
            "[CONNECTION MANAGER] Received transcript for %s: %s",
            interview_id,
            transcript,
        )

        await self.interview_orchestrator.process_answer(
            interview_id=interview_id,
            transcript=transcript,
        )

    async def handle_runtime_status(
        self,
        interview_id: UUID,
        status: str,
    ) -> None:
        if self.interview_orchestrator is None:
            logger.warning(
                "[CONNECTION MANAGER] Cannot publish runtime status. "
                "InterviewOrchestrator is not initialized."
            )
            return

        await self.interview_orchestrator.publish_runtime_status(
            interview_id=interview_id,
            status=status,
        )

        # --------------------------------------------------
        # Audio receiver creation
        # --------------------------------------------------

    def create_audio_receiver(
        self,
        interview_id: UUID,
    ) -> AudioReceiver:

        async def on_transcript(transcript: str):
            await self.handle_transcript(
                interview_id=interview_id,
                transcript=transcript,
            )

        async def on_runtime_status(status: str):
            await self.handle_runtime_status(
                interview_id=interview_id,
                status=status,
            )

        receiver = AudioReceiver(
            stt_service=self.stt_service,
            on_transcript=on_transcript,
            on_runtime_status=on_runtime_status,
        )

        self.audio_receivers[interview_id] = receiver

        return receiver
    async def handle_audio_batch_drained(
        self,
        interview_id: UUID,
        batch_id: UUID,
        turn_number: int,
        stage: str,
    ) -> None:

        if self.interview_orchestrator is None:
            logger.warning(
                "[CONNECTION MANAGER] Cannot publish audio batch drained. "
                "InterviewOrchestrator is not initialized."
            )
            return

        await self.interview_orchestrator.handle_audio_batch_drained(
            interview_id=interview_id,
            batch_id=batch_id,
            turn_number=turn_number,
            stage=stage,
        )
    def on_audio_task_done(
        self,
        task: asyncio.Task,
        interview_id: UUID,
    ):
        if task.cancelled():
            return

        exception = task.exception()

        if exception:
            logger.error(
                "[CONNECTION MANAGER] Audio receiver failed for %s",
                interview_id,
                exc_info=(
                    type(exception),
                    exception,
                    exception.__traceback__,
                ),
            )

    # --------------------------------------------------
    # WebRTC connection creation
    # --------------------------------------------------

    async def create_connection(
        self,
        interview_id: UUID,
    ) -> RTCPeerConnection:

        existing_connection = self.connections.get(interview_id)

        if existing_connection:

            if existing_connection.connectionState != "closed":
                logger.warning(
                    "[CONNECTION MANAGER] Connection already exists: %s",
                    interview_id,
                )

                raise ValueError(
                    f"Active connection already exists for {interview_id}"
                )

            logger.info(
                "[CONNECTION MANAGER] Removing stale connection: %s",
                interview_id,
            )

            self.connections.pop(interview_id, None)

        peer_connection = RTCPeerConnection()
        @peer_connection.on("connectionstatechange")
        async def on_connection_state_change():
            logger.warning(
                "[SERVER] Connection state: %s",
                peer_connection.connectionState,
            )

        @peer_connection.on("iceconnectionstatechange")
        async def on_ice_connection_state_change():
            logger.warning(
                "[SERVER] ICE state: %s",
                peer_connection.iceConnectionState,
            )

        @peer_connection.on("track")
        def on_track(track):

            logger.info(
                "[SERVER] Received remote track: %s",
                track.kind,
            )

            if track.kind != "audio":
                return

            existing_task = self.audio_tasks.get(interview_id)

            if existing_task and not existing_task.done():
                logger.warning(
                    "[SERVER] Audio receiver already running for %s",
                    interview_id,
                )
                return

            logger.info("[SERVER] Starting incoming audio receiver")

            receiver = self.create_audio_receiver(interview_id)

            task = asyncio.create_task(receiver.receive(track))

            self.audio_tasks[interview_id] = task

            task.add_done_callback(
                lambda completed_task: self.on_audio_task_done(
                    completed_task,
                    interview_id,
                )
            )

        self.connections[interview_id] = peer_connection

        return peer_connection

    # --------------------------------------------------
    # Get connection
    # --------------------------------------------------

    def get_connection(
        self,
        interview_id: UUID,
    ) -> RTCPeerConnection | None:

        return self.connections.get(interview_id)

    # --------------------------------------------------
    # Connection cleanup
    # --------------------------------------------------

    async def close_connection(
        self,
        interview_id: UUID,
    ) -> None:
        logger.warning(
            "[CONNECTION MANAGER] close_connection() invoked for %s\n%s",
            interview_id,
            "".join(traceback.format_stack()),
        )
        peer_connection = self.connections.pop(
            interview_id,
            None,
        )

        audio_task = self.audio_tasks.pop(
            interview_id,
            None,
        )

        self.audio_receivers.pop(interview_id, None)
        self.outgoing_audio_tracks.pop(interview_id, None)

        try:
            if audio_task is not None and not audio_task.done():
                audio_task.cancel()

                try:
                    await audio_task

                except asyncio.CancelledError:
                    pass

                except Exception:
                    logger.exception(
                        "[CONNECTION MANAGER] Error closing audio task"
                    )

        finally:
            logger.info("[CONNECTION MANAGER] Closing peer connection")
            if peer_connection is not None:
                await peer_connection.close()

        logger.info(
            "[CONNECTION MANAGER] Closed connection: %s",
            interview_id,
        )

    # --------------------------------------------------
    # Outgoing audio track
    # --------------------------------------------------

    def add_audio_track(
        self,
        interview_id: UUID,
        audio_track: GeneratedAudioTrack,
    ) -> None:

        peer_connection = self.get_connection(interview_id)

        if peer_connection is None:
            raise ValueError("WebRTC connection not found.")

        if interview_id in self.outgoing_audio_tracks:
            raise ValueError("Outgoing audio track already exists for this interview.")
        async def on_batch_drained(
            batch_id: UUID,
            turn_number: int,
            stage: str,
        ):
            await self.handle_audio_batch_drained(
                interview_id=interview_id,
                batch_id=batch_id,
                turn_number=turn_number,
                stage=stage,
            )

        audio_track.on_batch_drained = on_batch_drained

        peer_connection.addTrack(audio_track)

        self.outgoing_audio_tracks[interview_id] = audio_track

        logger.info(
            "[CONNECTION MANAGER] Outgoing audio track added: %s",
            interview_id,
        )

    def enqueue_audio(
        self,
        interview_id: UUID,
        frames,
        batch_id: UUID,
        turn_number: int,
        stage: str,
    ) -> None:

        audio_track = self.outgoing_audio_tracks.get(interview_id)

        if audio_track is None:
            raise ValueError(
                f"Outgoing audio track not found for interview: {interview_id}"
            )

        audio_track.add_frames(
            frames=frames,
            batch_id=batch_id,
            turn_number=turn_number,
            stage=stage,
        )

        logger.info(
            "[CONNECTION MANAGER] Audio queued: " "interview=%s batch=%s turn=%s stage=%s",
            interview_id,
            batch_id,
            turn_number,
            stage,
        )
