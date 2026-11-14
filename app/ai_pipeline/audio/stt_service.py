import asyncio
import logging

import numpy as np
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)


class STTService:
    SAMPLE_RATE = 16000

    def __init__(
        self,
        model_size: str = "base.en",
        device: str = "cpu",
        compute_type: str = "int8",
    ):
        logger.info("[STT] Loading Faster-Whisper model: %s", model_size)

        self.model = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )

        logger.info("[STT] Model loaded successfully")

    async def transcribe(self, audio: np.ndarray) -> dict:
        """
        Transcribe a 16kHz mono float32 NumPy audio array.
        Runs inference in a worker thread to avoid blocking asyncio.
        """
        if audio is None or audio.size == 0:
            raise ValueError("Audio segment is empty")

        audio = np.asarray(audio, dtype=np.float32).reshape(-1)

        return await asyncio.to_thread(
            self._transcribe_sync,
            audio,
        )

    def _transcribe_sync(self, audio: np.ndarray) -> dict:
        segments, info = self.model.transcribe(
            audio,
            language="en",
            beam_size=5,
            vad_filter=False,
        )

        # Consume the generator inside this worker thread.
        transcription_segments = []

        for segment in segments:
            transcription_segments.append(
                {
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text.strip(),
                }
            )

        transcript = " ".join(
            segment["text"] for segment in transcription_segments
        ).strip()

        result = {
            "text": transcript,
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": len(audio) / self.SAMPLE_RATE,
            "segments": transcription_segments,
        }

        logger.info("[STT] Transcription completed: %s", transcript)

        return result
