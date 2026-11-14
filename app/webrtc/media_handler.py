import numpy as np


class MediaHandler:
    def __init__(self, frame_duration_ms: int = 20):
        if frame_duration_ms <= 0:
            raise ValueError("Frame duration must be positive.")

        self.frame_duration_ms = frame_duration_ms

    def prepare_audio(
        self,
        audio: np.ndarray,
        sample_rate: int,
    ) -> np.ndarray:
        """Validate and prepare the generated audio waveform."""

        if not isinstance(audio, np.ndarray):
            raise TypeError("Audio must be a NumPy array.")

        if audio.size == 0:
            raise ValueError("Audio cannot be empty.")

        if sample_rate <= 0:
            raise ValueError("Sample rate must be positive.")

        audio = np.asarray(audio, dtype=np.float32)

        if audio.ndim != 1:
            raise ValueError("Expected mono audio waveform.")

        if not np.isfinite(audio).all():
            raise ValueError("Audio contains invalid values.")

        return audio

    def create_audio_frames(
        self,
        audio: np.ndarray,
        sample_rate: int,
    ):
        """Split the audio waveform into sequential frames."""

        audio = self.prepare_audio(audio, sample_rate)

        samples_per_frame = (sample_rate * self.frame_duration_ms) // 1000

        if samples_per_frame <= 0:
            raise ValueError("Invalid frame size.")

        for start in range(0, len(audio), samples_per_frame):
            frame = audio[start : start + samples_per_frame]
            yield frame
