from app.ai_pipeline.audio.tts_service import TTSService
from app.webrtc.media_handler import MediaHandler


def test_tts_to_media_pipeline():

    # 1. Initialize TTS service
    tts = TTSService()
    tts.load_model()

    # 2. Generate speech
    result = tts.generate_speech(
        "Welcome to your first-round interview. " "Tell me about your past experience."
    )

    audio = result["audio"]
    sample_rate = result["sample_rate"]

    print(f"Generated audio sample rate: {sample_rate}")
    print(f"Generated audio shape: {audio.shape}")

    # 3. Initialize MediaHandler
    media_handler = MediaHandler(frame_duration_ms=20)

    # 4. Convert waveform into audio frames
    frames = list(
        media_handler.create_audio_frames(
            audio,
            sample_rate,
        )
    )

    # 5. Verify generated frames
    print(f"Total audio frames: {len(frames)}")

    for index, frame in enumerate(frames):
        print(f"Frame {index}: {frame.shape}")

    # 6. Cleanup
    tts.shutdown()

    assert len(frames) > 0
