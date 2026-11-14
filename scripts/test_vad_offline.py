import logging
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.ai_pipeline.audio.vad_service import VADService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

INPUT_FILE = "test_audio/candidate_answer.wav"

SAMPLE_RATE = 16000
CHUNK_SIZE = 512
TRAILING_SILENCE_SECONDS = 2


def main():
    # Load original audio
    audio, original_sample_rate = sf.read(INPUT_FILE)

    # Ensure mono
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    # Convert to float32
    audio = audio.astype(np.float32)

    # Resample to 16 kHz
    audio = resample_poly(audio, up=320, down=441).astype(np.float32)

    logger.info("Original sample rate: %s", original_sample_rate)
    logger.info("Processed sample rate: %s", SAMPLE_RATE)
    logger.info("Audio duration: %.2f seconds", len(audio) / SAMPLE_RATE)

    # Append synthetic silence for end-of-speech testing
    silence = np.zeros(
        TRAILING_SILENCE_SECONDS * SAMPLE_RATE,
        dtype=np.float32,
    )
    audio = np.concatenate((audio, silence))

    logger.info(
        "Audio duration with trailing silence: %.2f seconds",
        len(audio) / SAMPLE_RATE,
    )

    # Initialize VAD
    vad = VADService()

    total_chunks = 0
    speech_started = False
    speech_ended = False

    # Process audio in fixed-size chunks
    for start in range(0, len(audio), CHUNK_SIZE):
        chunk = audio[start : start + CHUNK_SIZE]

        # Pad the final incomplete chunk
        if len(chunk) < CHUNK_SIZE:
            chunk = np.pad(chunk, (0, CHUNK_SIZE - len(chunk)))

        event = vad.process_chunk(chunk)
        total_chunks += 1

        if event:
            logger.info("VAD EVENT: %s", event)

            if "start" in event:
                speech_started = True

            if "end" in event:
                speech_ended = True

    logger.info("Total chunks processed: %s", total_chunks)
    logger.info("Speech started: %s", speech_started)
    logger.info("Speech ended: %s", speech_ended)


if __name__ == "__main__":
    main()