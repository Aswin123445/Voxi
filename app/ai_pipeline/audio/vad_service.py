import logging

import numpy as np
import torch
from silero_vad import VADIterator, load_silero_vad

logger = logging.getLogger(__name__)


class VADService:
    SAMPLE_RATE = 16000
    CHUNK_SIZE = 512

    def __init__(
        self,
        threshold: float = 0.5,
        min_silence_duration_ms: int = 1200,
        speech_pad_ms: int = 200,
    ):
        self.model = load_silero_vad()

        self.vad_iterator = VADIterator(
            self.model,
            sampling_rate=self.SAMPLE_RATE,
            threshold=threshold,
            min_silence_duration_ms=min_silence_duration_ms,
            speech_pad_ms=speech_pad_ms,
        )

        logger.info("[VAD] Service initialized")

    def process_chunk(self, audio_chunk: np.ndarray):
        """
        Process one 512-sample, 16kHz mono audio chunk.

        Returns:
            dict: Speech start or end event.
            None: No speech state transition.
        """
        if audio_chunk.ndim != 1:
            raise ValueError("Expected mono audio (1D array)")

        if audio_chunk.shape[0] != self.CHUNK_SIZE:
            raise ValueError(
                f"Expected {self.CHUNK_SIZE} samples, "
                f"received {audio_chunk.shape[0]}"
            )

        audio_chunk = audio_chunk.astype(np.float32, copy=False)
        audio_tensor = torch.from_numpy(audio_chunk)

        with torch.inference_mode():
            event = self.vad_iterator(
                audio_tensor,
                return_seconds=True,
            )

        if event:
            logger.info("[VAD] Event detected: %s", event)

        return event

    def reset(self) -> None:
        """Reset VAD state between interview sessions."""
        self.vad_iterator.reset_states()
        logger.info("[VAD] State reset")
