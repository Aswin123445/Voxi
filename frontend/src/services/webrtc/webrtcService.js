import { exchangeSdpOffer } from "./signalingService";
const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
];

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
  onSignalingSocket,
}) {
  let signalingSocket = null;

  try {
    const offer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(offer);

    await waitForIceGatheringComplete(peerConnection);

    const answer = await exchangeSdpOffer(
      interviewId,
      peerConnection.localDescription,
      {
        onSocket: (socket) => {
          signalingSocket = socket;
          onSignalingSocket?.(socket);
        },

        onEvent: (payload) => {
          console.log(`[INTERVIEW EVENT] ${payload.event}`, payload.data);

          onInterviewEvent?.(payload);
        },
      },
    );

    await peerConnection.setRemoteDescription(answer);

    return {
      peerConnection,
      signalingSocket,
    };
  } catch (error) {
    closeWebRTCConnection(peerConnection, signalingSocket);
    throw error;
  }
}

export function sendSignalingEvent(socket, event, data = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("[SIGNALING] Cannot send event. Socket is not open.");

    return false;
  }

  try {
    socket.send(
      JSON.stringify({
        event,
        data,
      }),
    );

    console.log("[SIGNALING] Event sent:", event);

    return true;
  } catch (error) {
    console.error("[SIGNALING] Failed to send event:", error);

    return false;
  }
}

export function closeWebRTCConnection(peerConnection, signalingSocket) {
  if (signalingSocket && signalingSocket.readyState !== WebSocket.CLOSED) {
    signalingSocket.close();
  }

  if (!peerConnection) return;

  peerConnection.ontrack = null;
  peerConnection.onconnectionstatechange = null;
  peerConnection.oniceconnectionstatechange = null;

  if (peerConnection.signalingState !== "closed") {
    peerConnection.close();
  }
}
