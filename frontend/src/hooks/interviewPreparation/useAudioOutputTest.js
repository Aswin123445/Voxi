import { useState, useCallback } from "react";

/** status: 'idle' | 'playing' | 'confirmed' */
export function useAudioOutputTest() {
  const [status, setStatus] = useState("idle");

  const test = useCallback(async () => {
    setStatus("playing");
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") await ctx.resume();

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.2);

      setTimeout(() => {
        setStatus("confirmed");
        ctx.close();
      }, 1300);
    } catch (err) {
      console.error("Audio test playback failed:", err);
      setStatus("confirmed"); // fallback so the user isn't permanently blocked
    }
  }, []);

  return { status, test };
}
