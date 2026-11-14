import asyncio

from webrtc.microphone_track import MicrophoneTrack


async def main():
    microphone = MicrophoneTrack(device_id=1)

    try:
        await microphone.start()

        print("Microphone started. Speak now...")

        for i in range(100):
            frame = await microphone.recv()

            audio = frame.to_ndarray()

            print(
                f"Frame: {i + 1} | "
                f"Sample rate: {frame.sample_rate} | "
                f"PTS: {frame.pts} | "
                f"Time base: {frame.time_base} | "
                f"Shape: {audio.shape}"
            )

    finally:
        microphone.stop()


if __name__ == "__main__":
    asyncio.run(main())
