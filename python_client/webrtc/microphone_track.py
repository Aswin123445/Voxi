import asyncio
from fractions import Fraction
import logging

import av
import sounddevice as sd

from aiortc import AudioStreamTrack

logger = logging.getLogger(__name__)


class MicrophoneTrack(AudioStreamTrack):
    SAMPLE_RATE = 16000
    CHANNELS = 1

    FRAME_DURATION_MS = 20

    FRAME_SIZE = int(SAMPLE_RATE * FRAME_DURATION_MS / 1000)
    # Match aiortc's timestamp clock to our audio sample rate.
    clock_rate = SAMPLE_RATE
    samples = FRAME_SIZE

    def __init__(self, device_id: int = 1):
        super().__init__()
        self._timestamp = 0
        self.device_id = device_id
        self.audio_queue = None
        self.loop = None
        self.stream = None

    async def start(self):
        """Start capturing audio from the physical microphone."""

        self.loop = asyncio.get_running_loop()
        self.audio_queue = asyncio.Queue(maxsize=50)

        self.stream = sd.InputStream(
            device=self.device_id,
            samplerate=self.SAMPLE_RATE,
            channels=self.CHANNELS,
            dtype="int16",
            blocksize=self.FRAME_SIZE,
            callback=self._audio_callback,
        )

        self.stream.start()

        logger.info("[MIC] Microphone started")

    def _audio_callback(self, indata, frames, time_info, status):
        """Called by sounddevice whenever microphone audio arrives."""

        if status:
            logger.warning("[MIC] Audio status: %s", status)

        if self.loop is None or self.loop.is_closed():
            return

        audio_data = indata.copy()

        self.loop.call_soon_threadsafe(
            self._enqueue_audio,
            audio_data,
        )

    def _enqueue_audio(self, audio_data):
        """Move microphone data into the asyncio queue."""

        if self.audio_queue is None:
            return

        if self.audio_queue.full():
            # Drop the oldest frame if the queue is full.
            try:
                self.audio_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass

        self.audio_queue.put_nowait(audio_data)


    async def recv(self):
        """Provide the next microphone frame to WebRTC."""
    
        audio_data = await self.audio_queue.get()
    
        # Convert (samples, channels) to (channels, samples).
        audio_data = audio_data.T
    
        frame = av.AudioFrame.from_ndarray(
            audio_data,
            format="s16",
            layout="mono",
        )
    
        frame.sample_rate = self.SAMPLE_RATE
    
        # Assign timestamps manually.
        frame.pts = self._timestamp
        frame.time_base = Fraction(1, self.SAMPLE_RATE)
    
        # Advance timestamp by the number of samples.
        self._timestamp += self.FRAME_SIZE
    
        return frame

    def stop(self):
        """Stop microphone capture and release resources."""

        if self.stream is not None:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        super().stop()

        logger.info("[MIC] Microphone stopped")
