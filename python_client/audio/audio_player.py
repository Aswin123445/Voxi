import asyncio
import logging

import numpy as np
import sounddevice as sd

logger = logging.getLogger(__name__)


class AudioPlayer:

    def __init__(self, sample_rate=48000, channels=2):
        self.sample_rate = sample_rate
        self.channels = channels

        self.stream = None
        self.is_playing = False

    def start(self):
        """Initialize the audio output stream."""

        if self.is_playing:
            return

        self.stream = sd.OutputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            dtype="int16",
        )

        self.stream.start()
        self.is_playing = True

        logger.info(
            "[PLAYER] Audio output started: %s Hz, %s channels",
            self.sample_rate,
            self.channels,
        )

    def play(self, audio_data: np.ndarray):
        """Send PCM samples to the speaker."""

        if self.is_playing and self.stream:
            self.stream.write(audio_data)

    def stop(self):
        """Stop and release the audio output stream."""

        self.is_playing = False

        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None

        logger.info("[PLAYER] Audio output stopped")

    async def consume(self, track):
        """Receive and play incoming WebRTC audio frames."""

        self.start()

        frame_count = 0

        try:
            while self.is_playing:
                frame = await track.recv()
                frame_count += 1

                # Current negotiated format: s16, stereo, 48000 Hz.
                if (
                    frame.sample_rate != self.sample_rate
                    or frame.layout.name != "stereo"
                    or frame.format.name != "s16"
                ):
                    raise ValueError(
                        "Unexpected audio format: "
                        f"rate={frame.sample_rate}, "
                        f"layout={frame.layout.name}, "
                        f"format={frame.format.name}"
                    )

                # Packed stereo s16 frames are returned as
                # a single row containing interleaved samples.
                audio_data = frame.to_ndarray()
                audio_data = audio_data.reshape(
                    frame.samples,
                    self.channels,
                )

                self.play(audio_data)

                if frame_count == 1:
                    logger.info(
                        "[PLAYER] First audio frame played: "
                        "samples=%s, rate=%s, format=%s, layout=%s",
                        frame.samples,
                        frame.sample_rate,
                        frame.format.name,
                        frame.layout.name,
                    )

        except asyncio.CancelledError:
            logger.warning("[PLAYER] Playback task was cancelled")
            raise
        
        except Exception as exc:
            logger.exception(
                "[PLAYER] Playback stopped unexpectedly: %s",
                type(exc).__name__,
            )
        
        finally:
            logger.info(
                "[PLAYER] Playback consumer exiting. Frames received: %s",
                frame_count,
            )
            self.stop()
