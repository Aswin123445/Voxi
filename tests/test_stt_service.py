import logging
import numpy as np
import soundfile as sf

from app.ai_pipeline.audio.stt_service import STTService

logging.basicConfig(level=logging.INFO)

# Initialize model
stt_service = STTService(
    model_size="base.en",
    device="cpu",
    compute_type="int8",
)

# Load an existing test audio file
audio, sample_rate = sf.read("test_audio/candidate_answer.wav")

# Convert stereo to mono if necessary
if audio.ndim == 2:
    audio = audio.mean(axis=1)

# Resample to 16kHz if necessary
if sample_rate != 16000:
    import librosa

    audio = librosa.resample(
        audio.astype(np.float32),
        orig_sr=sample_rate,
        target_sr=16000,
    )

audio = audio.astype(np.float32)

# Run transcription
import asyncio


async def main():
    result = await stt_service.transcribe(audio)

    print("\n--- TRANSCRIPTION RESULT ---")
    print("Text:", result["text"])
    print("Language:", result["language"])
    print("Duration:", result["duration"])
    print("Segments:", result["segments"])


if __name__ == "__main__":
    asyncio.run(main())
