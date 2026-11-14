import { useState, useEffect } from "react";

export function useRoomMicrophone(providedStream) {
  const [stream, setStream] = useState(null);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let ownStream = null;
    let audioCtx = null;
    let animationFrame = null;

    async function initialize() {
      let activeStream;

      // Step 1: Acquire or reuse the microphone stream.
      try {
        activeStream =
          providedStream ||
          (ownStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          }));
          console.log("[MIC] Stream acquired:", activeStream);
          console.log("[MIC] Audio tracks:", activeStream.getAudioTracks());

        if (cancelled) {
          ownStream?.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(activeStream);
        console.log("[MIC] Stream passed to room state");
        setError("");
      } catch (err) {
        if (cancelled) return;

        console.error("Microphone access failed:", err);
        setError("Microphone access is required for the interview.");
        return;
      }

      // Step 2: Initialize the audio analyser.
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        audioCtx = new AudioContextClass();

        if (audioCtx.state === "suspended") {
          try {
            await audioCtx.resume();
          } catch (err) {
            // React may have cleaned up this effect while resume was pending.
            if (cancelled || audioCtx.state === "closed") return;

            // Audio analysis is optional; microphone capture can still work.
            console.warn("AudioContext resume failed:", err);
            return;
          }
        }

        if (cancelled || audioCtx.state === "closed") return;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;

        const source = audioCtx.createMediaStreamSource(activeStream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (cancelled) return;

          analyser.getByteFrequencyData(data);

          const average =
            data.reduce((sum, value) => sum + value, 0) / data.length;

          setLevel(Math.min(100, Math.round((average / 128) * 100)));

          animationFrame = requestAnimationFrame(tick);
        };

        tick();
      } catch (err) {
        if (!cancelled) {
          console.warn("Audio analyser initialization failed:", err);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }

      // Only stop streams acquired by this hook.
      ownStream?.getTracks().forEach((track) => track.stop());
    };
  }, [providedStream]);

  return { stream, level, error };
}
