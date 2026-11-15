import { useState, useEffect, useRef, useCallback } from "react";

import {
  createWebRTCConnection,
  establishWebRTCSession,
  closeWebRTCConnection,
  sendSignalingEvent,
} from "../../services/webrtc/webrtcService";

export function useWebRTC({ interviewId, stream, onInterviewEvent }) {
  const peerConnectionRef = useRef(null);
  const signalingSocketRef = useRef(null);
  const attemptRef = useRef(0);

  const onInterviewEventRef = useRef(onInterviewEvent);

  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  // Keep the latest event callback without restarting WebRTC.
  useEffect(() => {
    onInterviewEventRef.current = onInterviewEvent;
  }, [onInterviewEvent]);

  useEffect(() => {
    console.log("[WEBRTC] Initialization started");
    console.log("[WEBRTC] Interview ID:", interviewId);
    console.log("[WEBRTC] Stream:", stream);

    if (!interviewId || !stream) {
      console.warn("[WEBRTC] Missing interview ID or stream");
      return;
    }

    const audioTracks = stream.getAudioTracks();

    if (
      audioTracks.length === 0 ||
      audioTracks.some((track) => track.readyState !== "live")
    ) {
      console.warn("[WEBRTC] No active microphone tracks");
      return;
    }

    let cancelled = false;
    let peerConnection = null;
    let signalingSocket = null;

    const currentAttempt = ++attemptRef.current;

    const isCurrentAttempt = () =>
      !cancelled && attemptRef.current === currentAttempt;

    async function initializeConnection() {
      try {
        const connection = createWebRTCConnection({
          stream,

          onConnectionStateChange: (state) => {
            if (isCurrentAttempt()) {
              setConnectionState(state);
            }
          },

          onIceConnectionStateChange: (state) => {
            if (isCurrentAttempt()) {
              setIceConnectionState(state);
            }
          },

          onRemoteStream: (audioStream) => {
            if (isCurrentAttempt()) {
              console.log(
                "[WEBRTC] Remote audio stream received:",
                audioStream,
              );

              setRemoteStream(audioStream);
            }
          },
        });

        peerConnection = connection.peerConnection;
        peerConnectionRef.current = peerConnection;

        await establishWebRTCSession({
          peerConnection,
          interviewId,

          onInterviewEvent: (payload) => {
            if (isCurrentAttempt()) {
              onInterviewEventRef.current?.(payload);
            }
          },

          onSignalingSocket: (socket) => {
            if (!isCurrentAttempt()) {
              closeWebRTCConnection(peerConnection, socket);
              return;
            }

            signalingSocket = socket;
            signalingSocketRef.current = socket;
          },
        });

        if (!isCurrentAttempt()) return;

        setError("");
      } catch (err) {
        if (!isCurrentAttempt()) return;

        console.error("[WEBRTC] Connection failed:", err);

        setError(err.message || "Unable to establish WebRTC connection.");

        setConnectionState("failed");
      }
    }

    initializeConnection();

    return () => {
      cancelled = true;

      if (peerConnection) {
        closeWebRTCConnection(peerConnection, signalingSocket);
      }

      if (peerConnectionRef.current === peerConnection) {
        peerConnectionRef.current = null;
      }

      if (signalingSocketRef.current === signalingSocket) {
        signalingSocketRef.current = null;
      }
    };
  }, [interviewId, stream, attempt]);

  // Send events through the existing signaling WebSocket.
  const sendEvent = useCallback((event, data = {}) => {
    return sendSignalingEvent(signalingSocketRef.current, event, data);
  }, []);

  const disconnect = useCallback(() => {
    attemptRef.current += 1;

    const peerConnection = peerConnectionRef.current;
    const signalingSocket = signalingSocketRef.current;

    if (peerConnection || signalingSocket) {
      closeWebRTCConnection(peerConnection, signalingSocket);
    }

    peerConnectionRef.current = null;
    signalingSocketRef.current = null;

    setRemoteStream(null);
    setConnectionState("closed");
    setIceConnectionState("closed");
  }, []);

  const reconnect = useCallback(() => {
    disconnect();

    setError("");
    setAttempt((previous) => previous + 1);
  }, [disconnect]);

  return {
    connectionState,
    iceConnectionState,
    remoteStream,
    error,
    disconnect,
    reconnect,
    sendEvent,
  };
}
