import asyncio
import logging
from typing import Awaitable, Callable

import numpy as np
from aiortc import MediaStreamError, MediaStreamTrack
import time
from app.ai_pipeline.audio.audio_processor import AudioProcessor
from app.ai_pipeline.audio.audio_chunker import AudioChunker
from app.ai_pipeline.audio.audio_buffer import AudioBuffer
from app.ai_pipeline.audio.stt_service import STTService
from app.ai_pipeline.audio.vad_service import VADService

logger = logging.getLogger(__name__)


class AudioReceiver:

    def __init__(
        self,
        stt_service: STTService,
        on_transcript: Callable[[str], Awaitable[None]],
        on_runtime_status: Callable[[str], Awaitable[None]] | None = None,
    ):
        self.audio_processor = AudioProcessor()
        self.audio_chunker = AudioChunker(chunk_size=512)
        self.vad_service = VADService()
        self.audio_buffer = AudioBuffer()
        self.stt_service = stt_service
        self.on_transcript = on_transcript
        self.on_runtime_status = on_runtime_status

        self.utterance_queue = asyncio.Queue(maxsize=5)
        self.utterance_worker_task = None
        self.accepting_audio = False

    def set_audio_accepting(self, enabled: bool) -> None:
        if self.accepting_audio == enabled:
            return

        self.accepting_audio = enabled

        # Clear audio accumulated during the previous state.
        self.audio_buffer.clear()
        self.audio_chunker.clear()
        self.vad_service.reset()

        logger.info(
            "[AUDIO RECEIVER] Audio acceptance changed: %s",
            "ENABLED" if enabled else "DISABLED",
        )

    async def publish_runtime_status(self, status: str) -> None:
        if self.on_runtime_status is None:
            return

        try:
            await self.on_runtime_status(status)
        except Exception:
            logger.exception(
                "[AUDIO RECEIVER] Failed to publish runtime status: %s",
                status,
            )

    async def schedule_utterance(self, audio_segment):

        await self.publish_runtime_status("PROCESSING")

        if self.utterance_worker_task is None or self.utterance_worker_task.done():
            self.utterance_worker_task = asyncio.create_task(self.process_utterance_queue())

        queued_at = time.perf_counter()

        await self.utterance_queue.put((audio_segment, queued_at))

    async def process_utterance_queue(self):
        while True:
            audio_segment, queued_at = await self.utterance_queue.get()

            try:
                queue_wait = time.perf_counter() - queued_at

                logger.info(
                    "[TIMING] Utterance queue wait: %.3f seconds",
                    queue_wait,
                )

                await self.handle_utterance(audio_segment)

            except Exception:
                logger.exception("Utterance processing failed")

            finally:
                self.utterance_queue.task_done()

    async def process_utterance(
        self,
        audio_segment: np.ndarray,
    ) -> str | None:
        """
        Convert candidate audio into text using STT.
        """
        try:
            logger.info("[AUDIO RECEIVER] Transcribing candidate audio")

            start_time = time.perf_counter()

            result = await self.stt_service.transcribe(audio_segment)

            stt_duration = time.perf_counter() - start_time

            logger.info(
                "[TIMING] STT transcription completed in %.3f seconds",
                stt_duration,
            )

            transcript = result["text"].strip()

            if not transcript:
                logger.warning("[AUDIO RECEIVER] Empty transcription")
                return None

            logger.info("[AUDIO RECEIVER] Transcription completed")

            return transcript

        except Exception:
            logger.exception("[AUDIO RECEIVER] Transcription failed")
            return None

    async def handle_utterance(self, audio_segment: np.ndarray):
        """
        Transcribe the utterance and forward the transcript.
        """
        transcript = await self.process_utterance(audio_segment)

        if transcript is None:
            return

        logger.info("[AUDIO RECEIVER] Transcript: %s", transcript)
        logger.info("[AUDIO RECEIVER] Calling transcript callback")

        await self.on_transcript(transcript)

        logger.info("[AUDIO RECEIVER] Transcript callback completed")

    async def receive(self, track: MediaStreamTrack) -> None:

        frame_count = 0
        vad_chunk_count = 0

        # Reset processing state for a new audio track.
        self.audio_processor = AudioProcessor()
        self.audio_chunker.clear()
        self.vad_service.reset()
        self.audio_buffer.clear()

        logger.info("[AUDIO RECEIVER] Started receiving audio")

        try:
            while True:

                # 1. Receive incoming WebRTC audio frame.
                frame = await track.recv()
                frame_count += 1

                # 2. Convert to 16kHz mono float32.
                processed_audio = self.audio_processor.process(frame)

                if processed_audio.size == 0:
                    continue
                # Ignore candidate audio outside the listening window.
                if not self.accepting_audio:
                    continue

                # 3. Continuously store audio for pre-roll and recording.
                self.audio_buffer.append(processed_audio)

                # 4. Convert variable-size audio into 512-sample chunks.
                chunks = self.audio_chunker.add_audio(processed_audio)

                # 5. Pass each chunk to VAD.
                for chunk in chunks:
                    vad_chunk_count += 1

                    event = await asyncio.to_thread(
                        self.vad_service.process_chunk,
                        chunk,
                    )
                    if not self.accepting_audio:
                        continue

                    if not event:
                        continue

                    if "start" in event:

                        logger.info(
                            "[AUDIO RECEIVER] Speech started: %s",
                            event,
                        )
                        await self.publish_runtime_status("CANDIDATE_SPEAKING")

                        self.audio_buffer.start_recording()

                    elif "end" in event:

                        logger.info(
                            "[AUDIO RECEIVER] Speech ended: %s",
                            event,
                        )
                        # Finalize and retrieve the complete utterance.
                        audio_segment = self.audio_buffer.stop_recording()
                        self.set_audio_accepting(False)

                        if audio_segment is not None and audio_segment.size > 0:
                            await self.schedule_utterance(audio_segment)

        except MediaStreamError:
            logger.warning(
                "[AUDIO RECEIVER] Remote audio track ended unexpectedly. "
                "Frames received: %s | PC state: %s",
                frame_count,
                getattr(track, "readyState", "unknown"),
            )
            logger.info(
                "[AUDIO RECEIVER] Audio track ended. Total frames: %s",
                frame_count,
            )

        finally:
            if self.accepting_audio:
                # Flush remaining samples from the resampler.
                remaining_audio = self.audio_processor.flush()

                if remaining_audio.size > 0:
                    self.audio_buffer.append(remaining_audio)
                    chunks = self.audio_chunker.add_audio(remaining_audio)

                    for chunk in chunks:
                        vad_chunk_count += 1

                        event = await asyncio.to_thread(
                            self.vad_service.process_chunk,
                            chunk,
                        )

                        # The audio gate may have changed while VAD was running.
                        if not self.accepting_audio:
                            break

                        if not event:
                            continue

                        if "start" in event:
                            await self.publish_runtime_status("CANDIDATE_SPEAKING")
                            self.audio_buffer.start_recording()

                        elif "end" in event:
                            audio_segment = self.audio_buffer.stop_recording()
                            self.set_audio_accepting(False)

                            if audio_segment is not None and audio_segment.size > 0:
                                logger.info("[AUDIO RECEIVER] Final utterance detected")
                                await self.schedule_utterance(audio_segment)

                # Finalize an active utterance if the track ends
                # before VAD detects sufficient trailing silence.
                if self.accepting_audio:
                    audio_segment = self.audio_buffer.stop_recording()

                    if audio_segment is not None and audio_segment.size > 0:
                        logger.info("[AUDIO RECEIVER] Finalizing remaining utterance")
                        self.set_audio_accepting(False)
                        await self.schedule_utterance(audio_segment)
            else:
                self.audio_buffer.clear()

            await self.utterance_queue.join()

            if self.utterance_worker_task is not None:
                self.utterance_worker_task.cancel()

                await asyncio.gather(
                    self.utterance_worker_task,
                    return_exceptions=True,
                )

            logger.info("[AUDIO RECEIVER] Audio receiver stopped")
