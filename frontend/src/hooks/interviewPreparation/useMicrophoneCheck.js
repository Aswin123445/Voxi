import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioStream } from "../../context/AudioStreamContext";

function getErrorMessage(err) {
  if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
    return "Microphone permission was denied. Please allow access in your browser settings.";
  }

  if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
    return "No microphone detected. Please connect an audio input device.";
  }

  return err.message || "Unable to access your microphone.";
}

export function useMicrophoneCheck() {
  const { setStream: setContextStream, clearStream } = useAudioStream();

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [stream, setStream] = useState(null);
  const [level, setLevel] = useState(0);

  const audioContextRef = useRef(null);
  const frameRef = useRef(null);

  // Only clean up the audio analyser.
  // The context owns the microphone tracks.
  const cleanupMeter = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    audioContextRef.current = null;
  }, []);

  // Clean up the analyser when Preparation unmounts.
  // Do NOT stop the microphone stream here.
  useEffect(() => {
    return cleanupMeter;
  }, [cleanupMeter]);

  const startMeter = useCallback((mediaStream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      ctx.createMediaStreamSource(mediaStream).connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (ctx.state === "closed") return;

        analyser.getByteFrequencyData(data);

        const avg = data.reduce((sum, value) => sum + value, 0) / data.length;

        setLevel(Math.min(100, Math.round((avg / 128) * 100)));

        frameRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch (err) {
      console.warn("AudioContext meter initialization failed:", err);
    }
  }, []);

  const test = useCallback(async () => {
    cleanupMeter();
    clearStream();

    setStream(null);
    setLevel(0);
    setStatus("requesting");
    setError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Your browser does not support audio recording devices.",
        );
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const [track] = mediaStream.getAudioTracks();

      if (!track || !track.enabled || track.readyState !== "live") {
        mediaStream.getTracks().forEach((item) => item.stop());
        throw new Error("No active microphone track detected.");
      }

      // Transfer ownership to AudioStreamContext.
      setContextStream(mediaStream);

      setStream(mediaStream);
      setStatus("success");

      startMeter(mediaStream);
    } catch (err) {
      console.error("Microphone access error:", err);

      setStatus("error");
      setError(getErrorMessage(err));
    }
  }, [cleanupMeter, clearStream, setContextStream, startMeter]);

  const reset = useCallback(() => {
    cleanupMeter();

    // The context stops and releases the microphone.
    clearStream();

    setStream(null);
    setLevel(0);
    setStatus("idle");
    setError("");
  }, [cleanupMeter, clearStream]);

  return {
    status,
    error,
    stream,
    level,
    test,
    reset,
  };
}
