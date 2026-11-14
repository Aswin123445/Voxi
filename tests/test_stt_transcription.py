import asyncio
import time
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

from app.ai_pipeline.audio.stt_service import STTService

AUDIO_PATH = Path("test_audio/candidate_answer.wav")


async def main():
    if not AUDIO_PATH.exists():
        raise FileNotFoundError(AUDIO_PATH)

    # Load audio
    audio, sample_rate = sf.read(AUDIO_PATH)

    # Convert stereo to mono
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    print("Original sample rate:", sample_rate)

    # Resample to 16 kHz when necessary
    if sample_rate != STTService.SAMPLE_RATE:
        audio = librosa.resample(
            audio.astype(np.float32),
            orig_sr=sample_rate,
            target_sr=STTService.SAMPLE_RATE,
        )
        sample_rate = STTService.SAMPLE_RATE

    audio = np.asarray(audio, dtype=np.float32)

    print("Final sample rate:", sample_rate)
    print("Duration:", round(len(audio) / sample_rate, 2), "seconds")

    # Initialize STT service
    stt_service = STTService()

    # Transcribe
    start_time = time.perf_counter()

    result = await stt_service.transcribe(audio)

    processing_time = time.perf_counter() - start_time

    print("\n========== TRANSCRIPTION RESULT ==========")
    print("Transcript:", result["text"])
    print("Language:", result["language"])
    print("Language probability:", result["language_probability"])
    print("Audio duration:", result["duration"])
    print("Processing time:", round(processing_time, 2), "seconds")

    print("\n========== SEGMENTS ==========")
    for segment in result["segments"]:
        print(
            f"[{segment['start']:.2f}s - {segment['end']:.2f}s] " f"{segment['text']}"
        )


if __name__ == "__main__":
    asyncio.run(main())
