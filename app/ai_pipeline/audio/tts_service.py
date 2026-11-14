import numpy as np
from kokoro import KPipeline
import asyncio

class TTSService:
    def __init__(
        self,
        language_code: str = "a",
        voice: str = "af_heart",
        speed: float = 1.0,
    ):
        self.language_code = language_code
        self.voice = voice
        self.speed = speed

        self.pipeline: KPipeline | None = None
        self.sample_rate = 24000

    def load_model(self) -> None:
        """Initialize the Kokoro TTS pipeline."""
        if self.pipeline is not None:
            return

        self.pipeline = KPipeline(lang_code=self.language_code)

    def validate_text(self, text: str) -> str:
        """Validate and normalize text before speech generation."""
        if not isinstance(text, str):
            raise TypeError("Text must be a string.")

        text = text.strip()

        if not text:
            raise ValueError("Text cannot be empty.")

        return text

    def generate_speech(self, text: str) -> dict:
        """Generate speech and return the audio waveform."""
        if self.pipeline is None:
            raise RuntimeError("TTS model is not loaded. Call load_model() first.")

        text = self.validate_text(text)

        audio_chunks = []

        generator = self.pipeline(
            text,
            voice=self.voice,
            speed=self.speed,
        )

        for _, _, audio in generator:
            audio_chunks.append(np.asarray(audio, dtype=np.float32))

        if not audio_chunks:
            raise RuntimeError("Kokoro did not generate any audio.")

        audio = np.concatenate(audio_chunks)

        return {
            "audio": audio,
            "sample_rate": self.sample_rate,
        }
    async def generate_speech_async(self, text: str) -> dict:
        return await asyncio.to_thread(
            self.generate_speech,
            text,
        )

    def shutdown(self) -> None:
        """Release the model reference."""
        self.pipeline = None
