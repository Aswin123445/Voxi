import { exchangeSdpOffer } from "./signalingService";
const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];
let signalingSocket = null;

function waitForIceGatheringComplete(peerConnection, timeout = 15000) {
  if (peerConnection.iceGatheringState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("ICE gathering timed out."));
    }, timeout);

    function handleStateChange() {
      if (peerConnection.iceGatheringState === "complete") {
        cleanup();
        resolve();
      }
    }

    function cleanup() {
      clearTimeout(timer);
      peerConnection.removeEventListener(
        "icegatheringstatechange",
        handleStateChange,
      );
    }

    peerConnection.addEventListener(
      "icegatheringstatechange",
      handleStateChange,
    );
  });
}

export function createWebRTCConnection({
  stream,
  onConnectionStateChange,
  onIceConnectionStateChange,
  onRemoteStream,
}) {
  if (!stream) {
    throw new Error("Microphone stream is required.");
  }

  const peerConnection = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
  });

  // 1. Register connection state handlers.
  peerConnection.onconnectionstatechange = () => {
    onConnectionStateChange?.(peerConnection.connectionState);
  };

  peerConnection.oniceconnectionstatechange = () => {
    onIceConnectionStateChange?.(peerConnection.iceConnectionState);
  };

  // 2. Receive the AI's audio stream.
  peerConnection.ontrack = (event) => {
    if (event.track.kind === "audio") {
      const [remoteStream] = event.streams;

      if (remoteStream) {
        onRemoteStream?.(remoteStream);
      }
    }
  };

  // 3. Add candidate microphone tracks.
  stream.getAudioTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });

  return {
    peerConnection,
  };
}


export async function establishWebRTCSession({
  peerConnection,
  interviewId,
  onInterviewEvent,
}) {
  try {
    // 4. Create SDP offer.
    const offer = await peerConnection.createOffer();

    // 5. Set local description.
    await peerConnection.setLocalDescription(offer);

    // 6. Wait for ICE gathering.
    await waitForIceGatheringComplete(peerConnection);

    // 7. Exchange SDP and register event handlers.
    const answer = await exchangeSdpOffer(
      interviewId,
      peerConnection.localDescription,
      {
        onSocket: (socket) => {
          signalingSocket = socket;
        },

        onEvent: (payload) => {
          console.log(`[INTERVIEW EVENT] ${payload.event}`, payload.data);

          onInterviewEvent?.(payload);
        },
      },
    );

    // 8. Apply remote SDP answer.
    await peerConnection.setRemoteDescription(answer);

    return peerConnection;
  } catch (error) {
    closeWebRTCConnection(peerConnection);
    throw error;
  }
}


export function closeWebRTCConnection(peerConnection) {
  // Close signaling WebSocket independently.
  if (signalingSocket) {
    signalingSocket.close();
    signalingSocket = null;
  }

  if (!peerConnection) return;

  peerConnection.ontrack = null;
  peerConnection.onconnectionstatechange = null;
  peerConnection.oniceconnectionstatechange = null;

  if (peerConnection.signalingState !== "closed") {
    peerConnection.close();
  }
}
