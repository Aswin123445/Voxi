import asyncio
import json

import websockets

from aiortc import (
    RTCPeerConnection,
    RTCSessionDescription,
)
from aiortc.contrib.media import MediaRecorder

INTERVIEW_ID = "03f01fa2-b7c0-4780-a8cc-f5810b48bf81"

SIGNALING_URL = f"ws://127.0.0.1:8000/api/v1/ws/interviews/" f"{INTERVIEW_ID}/signaling"
RECORDING_FILE = "voxi_received.wav"


async def main():

    peer_connection = RTCPeerConnection()

    recorder = MediaRecorder(
        RECORDING_FILE,
        format="wav",
    )

    track_received = asyncio.Event()
    recorder_started = asyncio.Event()

    # We only need to receive AI audio in this first test.
    peer_connection.addTransceiver(
        "audio",
        direction="recvonly",
    )

    @peer_connection.on("track")
    def on_track(track):

        print("[CLIENT] Received track:", track.kind)

        if track.kind != "audio":
            return

        recorder.addTrack(track)
        track_received.set()

        async def start_recording():
            await recorder.start()
            recorder_started.set()
            print("[CLIENT] Recording started")

        asyncio.create_task(start_recording())

    try:

        # 1. Create SDP offer
        offer = await peer_connection.createOffer()

        await peer_connection.setLocalDescription(offer)

        print("[CLIENT] SDP offer created")

        # 2. Connect to signaling WebSocket
        async with websockets.connect(SIGNALING_URL) as websocket:

            await websocket.send(
                json.dumps(
                    {
                        "event": "offer",
                        "sdp": peer_connection.localDescription.sdp,
                        "sdp_type": peer_connection.localDescription.type,
                    }
                )
            )

            print("[CLIENT] SDP offer sent")

            # 3. Receive SDP answer
            response = json.loads(await websocket.recv())

            if response.get("event") != "answer":
                raise RuntimeError(f"Unexpected signaling response: {response}")

            print("[CLIENT] SDP answer received")

            # 4. Apply server's SDP answer
            answer = RTCSessionDescription(
                sdp=response["sdp"],
                type=response["type"],
            )

            await peer_connection.setRemoteDescription(answer)

            print("[CLIENT] Remote description applied")

        # Signaling WebSocket can close.
        # WebRTC media continues independently.

        # 5. Wait for outgoing audio track
        await asyncio.wait_for(
            track_received.wait(),
            timeout=30,
        )

        await asyncio.wait_for(
            recorder_started.wait(),
            timeout=10,
        )

        print("[CLIENT] Receiving server audio...")
        print("[CLIENT] Recording to:", RECORDING_FILE)

        # Keep the connection alive for two turns.
        # Trigger the second question from your backend during this time.
        await asyncio.sleep(120)

    finally:

        if recorder_started.is_set():
            await recorder.stop()

        await peer_connection.close()

        print("[CLIENT] WebRTC connection closed")


if __name__ == "__main__":
    asyncio.run(main())
