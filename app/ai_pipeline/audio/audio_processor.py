import logging

import av
import numpy as np

logger = logging.getLogger(__name__)


class AudioProcessor:
    TARGET_SAMPLE_RATE = 16000
    TARGET_CHANNELS = 1

    def __init__(self):
        self.resampler = av.AudioResampler(
            format="fltp",
            layout="mono",
            rate=self.TARGET_SAMPLE_RATE,
        )

    def process(self, frame: av.AudioFrame) -> np.ndarray:
        """
        Convert an incoming WebRTC audio frame into
        16kHz mono float32 audio samples.
        """
        resampled_frames = self.resampler.resample(frame)

        if not resampled_frames:
            return np.empty(0, dtype=np.float32)

        audio_chunks = []

        for resampled_frame in resampled_frames:
            audio = resampled_frame.to_ndarray()
            audio = audio.reshape(-1).astype(np.float32)
            audio_chunks.append(audio)

        if not audio_chunks:
            return np.empty(0, dtype=np.float32)

        return np.concatenate(audio_chunks)

    def flush(self) -> np.ndarray:
        """
        Retrieve any remaining samples held by the resampler.
        Call this when the incoming audio track ends.
        """
        remaining_frames = self.resampler.resample(None)

        if not remaining_frames:
            return np.empty(0, dtype=np.float32)

        return np.concatenate(
            [
                frame.to_ndarray().reshape(-1).astype(np.float32)
                for frame in remaining_frames
            ]
        )
