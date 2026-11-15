import { useParams, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";

import { useAudioStream } from "../context/AudioStreamContext";
import { useRoomMicrophone } from "../hooks/interviewRoom/useRoomMicrophone";
import { useInterviewSession } from "../hooks/interviewRoom/useInterviewSession";
import { useEndInterview } from "../hooks/interviewRoom/useEndInterview";
import { useWebRTC } from "../hooks/interviewRoom/useWebRTC";

import ConversationView from "../components/InterviewRoom/ConversationView";
import EndInterviewModal from "../components/InterviewRoom/EndInterviewModal";

export default function InterviewRoom() {
  const remoteAudioRef = useRef(null);
  const sessionRef = useRef(null);

  const { interviewId } = useParams();
  const navigate = useNavigate();

  const { stream } = useAudioStream();

  const mic = useRoomMicrophone(stream);

  const rtc = useWebRTC({
    interviewId,
    stream: mic.stream,

    onInterviewEvent: (payload) => {
      console.log("[ROOM] Backend event received:", payload.event);
      console.log("[ROOM] Event data:", payload.data);

      sessionRef.current?.(payload);
    },
  });

  const session = useInterviewSession({
    rtcConnectionState: rtc.connectionState,
    rtcError: rtc.error,
    micError: mic.error,
  });

  useEffect(() => {
    sessionRef.current = session.handleInterviewEvent;
  }, [session.handleInterviewEvent]);

  const end = useEndInterview({
    interviewId,
    stream: mic.stream,
  });

  // Attach remote audio and monitor actual AI playback.
  useEffect(() => {
    const audio = remoteAudioRef.current;

    if (!audio || !rtc.remoteStream) return;

    let disposed = false;
    let animationFrameId = null;

    let audioContext = null;
    let source = null;
    let analyser = null;

    let isSpeaking = false;
    let lastAudibleAt = 0;

    const SILENCE_DURATION = 1500;
    const AUDIO_THRESHOLD = 0.008;

    audio.srcObject = rtc.remoteStream;

    async function startPlaybackMonitor() {
      try {
        await audio.play();

        if (disposed) return;

        console.log("[PLAYBACK] Remote audio playback started");
      } catch (error) {
        console.warn("[PLAYBACK] Browser could not start remote audio:", error);
        return;
      }

      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        if (disposed) return;

        source = audioContext.createMediaStreamSource(rtc.remoteStream);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);

        
const samples = new Uint8Array(analyser.fftSize);
let lastDebugAt = 0;

function monitorPlayback() {
  if (disposed || !analyser) return;

  analyser.getByteTimeDomainData(samples);

  let sum = 0;

  for (let i = 0; i < samples.length; i++) {
    const normalized = (samples[i] - 128) / 128;
    sum += normalized * normalized;
  }

  const rms = Math.sqrt(sum / samples.length);
  const now = performance.now();

  // Debug every 500ms
  if (now - lastDebugAt >= 500) {
    console.log("[PLAYBACK DEBUG]", {
      rms: Number(rms.toFixed(5)),
      isSpeaking,
      silenceDuration: isSpeaking ? Math.round(now - lastAudibleAt) : 0,
      threshold: AUDIO_THRESHOLD,
    });

    lastDebugAt = now;
  }

  // Detect AI audio starting
  if (rms >= AUDIO_THRESHOLD) {
    lastAudibleAt = now;

    if (!isSpeaking) {
      const sent = rtc.sendEvent("ai.playback.started");

      console.log("[PLAYBACK] Started event send result:", sent);

      if (sent) {
        isSpeaking = true;
        console.log("[PLAYBACK] AI playback started event sent");
      }
    }
  }

  // Detect AI audio finishing
  else if (isSpeaking && now - lastAudibleAt >= SILENCE_DURATION) {
    console.log("[PLAYBACK] Silence threshold reached");

    const sent = rtc.sendEvent("ai.playback.finished");

    console.log("[PLAYBACK] Finished event send result:", sent);

    if (sent) {
      isSpeaking = false;
      lastAudibleAt = 0;

      console.log("[PLAYBACK] AI playback finished event sent");
    }
  }

  animationFrameId = requestAnimationFrame(monitorPlayback);
}

monitorPlayback();

      } catch (error) {
        console.error("[PLAYBACK] Failed to initialize audio monitor:", error);
      }
    }

    startPlaybackMonitor();

    return () => {
      disposed = true;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      if (source) {
        source.disconnect();
      }

      if (analyser) {
        analyser.disconnect();
      }

      if (audioContext && audioContext.state !== "closed") {
        audioContext.close().catch((error) => {
          console.warn("[PLAYBACK] AudioContext cleanup failed:", error);
        });
      }

      audio.pause();
      audio.srcObject = null;

      console.log("[PLAYBACK] Monitor cleaned up");
    };
  }, [rtc.remoteStream, rtc.sendEvent]);

  return (
    <div className="flex min-h-screen select-none flex-col bg-[#F8FAFC] font-sans text-[#0F172A] antialiased">
      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col justify-between px-4 py-2 sm:px-6 sm:py-12">
        <ConversationView
          state={session.conversationState}
          audioLevel={mic.level}
          errorMessage={mic.error || rtc.error || session.serverError}
          onViewResults={end.confirm}
          onRetry={rtc.reconnect}
          onHome={() => navigate("/")}
        />

        <audio ref={remoteAudioRef} autoPlay playsInline />
      </main>

      <EndInterviewModal
        open={end.isModalOpen}
        isEnding={end.isEnding}
        onCancel={end.closeModal}
        onConfirm={end.confirm}
      />
    </div>
  );
}
