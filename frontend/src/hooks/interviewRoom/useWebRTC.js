import { useState, useEffect, useRef, useCallback } from "react";

import {
  createWebRTCConnection,
  establishWebRTCSession,
  closeWebRTCConnection,
} from "../../services/webrtc/webrtcService";

export function useWebRTC({ interviewId, stream }) {
  const peerConnectionRef = useRef(null);
  const attemptRef = useRef(0);

  const [connectionState, setConnectionState] = useState("new");
  const [iceConnectionState, setIceConnectionState] = useState("new");
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
 
  useEffect(() => {
    console.log("[WEBRTC] Initialization started");
    console.log("[WEBRTC] Interview ID:", interviewId);
    console.log("[WEBRTC] Stream:", stream);

    if (!interviewId || !stream) {
      console.warn("[WEBRTC] Missing interview ID or stream");
      return;
    }
    if (!interviewId || !stream) return;

    const audioTracks = stream.getAudioTracks();

    if (
      audioTracks.length === 0 ||
      audioTracks.some((track) => track.readyState !== "live")
    ) {
      return;
    }

    let cancelled = false;
    let peerConnection = null;

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
              console.log("Remote audio stream received:", audioStream);
              console.log("Remote audio tracks:", audioStream.getAudioTracks());
              setRemoteStream(audioStream);
            }
          },
        });

        peerConnection = connection.peerConnection;
        peerConnectionRef.current = peerConnection;

        await establishWebRTCSession({
          peerConnection,
          interviewId,
        });

        if (!isCurrentAttempt()) return;

        setError("");
      } catch (err) {
        if (!isCurrentAttempt()) return;

        console.error("WebRTC connection failed:", err);

        setError(err.message || "Unable to establish WebRTC connection.");

        setConnectionState("failed");
      }
    }

    initializeConnection();

    return () => {
      cancelled = true;

      if (peerConnection) {
        closeWebRTCConnection(peerConnection);
      }

      if (peerConnectionRef.current === peerConnection) {
        peerConnectionRef.current = null;
      }
    };
  }, [interviewId, stream, attempt]);

  const disconnect = useCallback(() => {
    attemptRef.current += 1;

    const peerConnection = peerConnectionRef.current;

    if (peerConnection) {
      closeWebRTCConnection(peerConnection);
      peerConnectionRef.current = null;
    }

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
  };
}
