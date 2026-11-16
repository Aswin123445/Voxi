import asyncio
import logging
from collections.abc import Awaitable, Callable, Iterable
from dataclasses import dataclass
from fractions import Fraction
from uuid import UUID

import av
import numpy as np
from aiortc import AudioStreamTrack

logger = logging.getLogger(__name__)


@dataclass
class AudioFramePacket:
    """Audio frame with metadata identifying its question batch."""

    frame: np.ndarray
    batch_id: UUID
    turn_number: int
    stage: str
    is_last_frame: bool = False


BatchDrainedCallback = Callable[
    [UUID, int, str],
    Awaitable[None],
]


class GeneratedAudioTrack(AudioStreamTrack):
    """
    Persistent WebRTC audio track.

    Accepts multiple batches of generated audio frames
    throughout an interview.
    """

    def __init__(
        self,
        sample_rate: int = 24000,
        frame_duration_ms: int = 20,
        on_batch_drained: BatchDrainedCallback | None = None,
    ):
        
        super().__init__()

        if sample_rate <= 0:
            raise ValueError("Sample rate must be positive.")

        if frame_duration_ms <= 0:
            raise ValueError("Frame duration must be positive.")

        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms

        self.samples_per_frame = int(sample_rate * frame_duration_ms / 1000)

        self.audio_queue: asyncio.Queue[AudioFramePacket] = asyncio.Queue()

        self.timestamp = 0
        self.start_time = None
        self.frame_count = 0

        self.on_batch_drained = on_batch_drained

        logger.info("GeneratedAudioTrack initialized")

    def add_frames(
        self,
        frames: Iterable[np.ndarray],
        batch_id: UUID,
        turn_number: int,
        stage: str,
    ) -> None:
        """
        Add one question's audio frames to the queue.

        The final valid frame is marked with is_last_frame=True.
        """

        prepared_frames = []

        for frame in frames:
            audio_samples = np.asarray(frame, dtype=np.float32)

            if audio_samples.ndim != 1:
                raise ValueError("Expected mono audio samples.")

            if audio_samples.size == 0:
                continue

            if not np.isfinite(audio_samples).all():
                raise ValueError("Audio contains invalid values.")

            if audio_samples.size > self.samples_per_frame:
                raise ValueError(
                    "Audio frame exceeds samples_per_frame. "
                    "Check MediaHandler frame sizing."
                )

            if audio_samples.size < self.samples_per_frame:
                padding = self.samples_per_frame - audio_samples.size

                audio_samples = np.pad(
                    audio_samples,
                    (0, padding),
                )

            prepared_frames.append(audio_samples)

        if not prepared_frames:
            raise ValueError(
                f"No valid audio frames generated for batch: {batch_id}"
            )

        for index, audio_samples in enumerate(prepared_frames):
            packet = AudioFramePacket(
                frame=audio_samples,
                batch_id=batch_id,
                turn_number=turn_number,
                stage=stage,
                is_last_frame=index == len(prepared_frames) - 1,
            )

            self.audio_queue.put_nowait(packet)

        logger.info(
            "Audio batch queued: batch_id=%s turn=%s stage=%s "
            "frames=%s queue_size=%s",
            batch_id,
            turn_number,
            stage,
            len(prepared_frames),
            self.audio_queue.qsize(),
        )

    async def _notify_batch_drained(
        self,
        packet: AudioFramePacket,
    ) -> None:
        """Notify the orchestrator that the final frame was consumed."""

        if self.on_batch_drained is None:
            return

        try:
            await self.on_batch_drained(
                packet.batch_id,
                packet.turn_number,
                packet.stage,
            )
        except Exception:
            logger.exception(
                "Failed to notify batch drained: batch_id=%s turn=%s",
                packet.batch_id,
                packet.turn_number,
            )

    async def recv(self) -> av.AudioFrame:

        loop = asyncio.get_running_loop()

        # Maintain real-time pacing.
        if self.start_time is None:
            self.start_time = loop.time()

        expected_time = (
            self.start_time + self.frame_count * self.frame_duration_ms / 1000
        )

        delay = expected_time - loop.time()

        if delay > 0:
            await asyncio.sleep(delay)

        # Get the next audio packet.
        # If no audio is available, transmit silence.
        try:
            packet = self.audio_queue.get_nowait()
            audio_samples = packet.frame

        except asyncio.QueueEmpty:
            packet = None

            audio_samples = np.zeros(
                self.samples_per_frame,
                dtype=np.float32,
            )

        # Convert float32 to signed 16-bit PCM.
        audio_samples = np.clip(
            audio_samples,
            -1.0,
            1.0,
        )

        pcm_samples = (audio_samples * 32767).astype(np.int16)

        audio_frame = av.AudioFrame.from_ndarray(
            pcm_samples.reshape(1, -1),
            format="s16",
            layout="mono",
        )

        audio_frame.sample_rate = self.sample_rate
        audio_frame.pts = self.timestamp
        audio_frame.time_base = Fraction(1, self.sample_rate)

        self.timestamp += self.samples_per_frame
        self.frame_count += 1

        # The final frame has been handed to the WebRTC media pipeline.
        # This does not mean the browser has finished playing it.
        if packet is not None and packet.is_last_frame:
            logger.info(
                "Audio batch drained: batch_id=%s turn=%s stage=%s",
                packet.batch_id,
                packet.turn_number,
                packet.stage,
            )

            asyncio.create_task(self._notify_batch_drained(packet))

        return audio_frame
    
