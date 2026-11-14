import asyncio
import logging

from webrtc.peer_client import PeerClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)


INTERVIEW_ID = "c3767cef-1d8d-429f-b4fd-249637a7af77"
SIGNALING_URL = "ws://127.0.0.1:8000"


async def main():

    client = PeerClient(
        interview_id=INTERVIEW_ID,
        signaling_url=SIGNALING_URL,
        microphone_device_id=1,
    )

    try:
        await client.connect()

        print("\nWaiting for WebRTC connection...")

        await client.wait_until_connected()
        monitor_task = asyncio.create_task(
            client.monitor_connection()
        )

        try:
            await asyncio.Event().wait()
        finally:
            monitor_task.cancel()
            await asyncio.gather(
                monitor_task,
                return_exceptions=True,
            )
        print("\nWebRTC connection established!")
        print("Speak into your microphone.")

        # Keep the client alive.
        await asyncio.Event().wait()

    except KeyboardInterrupt:
        print("\nInterview client stopping...")

    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
