import asyncio
import logging
from collections.abc import Iterable
from fractions import Fraction

import av
import numpy as np
from aiortc import AudioStreamTrack

logger = logging.getLogger(__name__)


class GeneratedAudioTrack(AudioStreamTrack):
    """
    Persistent WebRTC audio track.

    Accepts multiple batches of generated audio frames
    throughout an interview.
    """

    def __init__(
        self,
        frames: Iterable[np.ndarray] | None = None,
        sample_rate: int = 24000,
        frame_duration_ms: int = 20,
    ):
        super().__init__()

        if sample_rate <= 0:
            raise ValueError("Sample rate must be positive.")

        if frame_duration_ms <= 0:
            raise ValueError("Frame duration must be positive.")

        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms

        self.samples_per_frame = int(sample_rate * frame_duration_ms / 1000)

        self.audio_queue: asyncio.Queue[np.ndarray] = asyncio.Queue()

        self.timestamp = 0
        self.start_time = None
        self.frame_count = 0

        # Optional initial audio
        if frames is not None:
            self.add_frames(frames)

        logger.info("GeneratedAudioTrack initialized")

    def add_frames(self, frames: Iterable[np.ndarray]):
        """
        Add a new batch of audio frames to the queue.
        """

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

            self.audio_queue.put_nowait(audio_samples)

        logger.info(
            "Audio frames queued. Queue size: %s",
            self.audio_queue.qsize(),
        )

    async def recv(self) -> av.AudioFrame:

        loop = asyncio.get_running_loop()

        # Maintain real-time pacing
        if self.start_time is None:
            self.start_time = loop.time()

        expected_time = (
            self.start_time + self.frame_count * self.frame_duration_ms / 1000
        )

        delay = expected_time - loop.time()

        if delay > 0:
            await asyncio.sleep(delay)

        # Get the next audio frame.
        # If no audio is available, transmit silence.
        try:
            audio_samples = self.audio_queue.get_nowait()

        except asyncio.QueueEmpty:
            audio_samples = np.zeros(
                self.samples_per_frame,
                dtype=np.float32,
            )

        # Convert float32 to signed 16-bit PCM
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
        audio_frame.time_base = Fraction(
            1,
            self.sample_rate,
        )

        self.timestamp += self.samples_per_frame
        self.frame_count += 1

        return audio_frame
