import { useParams, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";

import { useAudioStream } from "../context/AudioStreamContext";
import { useRoomMicrophone } from "../hooks/interviewRoom/useRoomMicrophone";
import { useInterviewSession } from "../hooks/interviewRoom/useInterviewSession";
import { useEndInterview } from "../hooks/interviewRoom/useEndInterview";
import { useWebRTC } from "../hooks/interviewRoom/useWebRTC";

import ConversationView from "../components/InterviewRoom/ConversationView";
import EndInterviewModal from "../components/InterviewRoom/EndInterviewModal";
import {AudioLines, Mic} from "lucide-react";

export default function InterviewRoom() {
  const remoteAudioRef = useRef(null);
  const sessionRef = useRef(null);

  // Tracks the currently playing AI audio batch.
  const activeBatchRef = useRef(null);

  // Handles the possibility that batch-drained arrives
  // before interview.started or question.audio.queued.
  const pendingDrainedBatchRef = useRef(null);

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

      const data = payload.data || {};

      // A new question audio batch has been registered.
      if (
        payload.event === "interview.started" ||
        payload.event === "question.audio.queued"
      ) {
        const { batch_id, turn_number, stage } = data;
        

        if (batch_id && Number.isInteger(turn_number)) {
          const pending = pendingDrainedBatchRef.current;
          const pendingMatches =
            pending?.batchId === batch_id &&
            pending?.turnNumber === turn_number;

          activeBatchRef.current = {
            batchId: batch_id,
            turnNumber: turn_number,
            stage,
            playbackStarted: false,
            playbackFinished: false,
            drained: pendingMatches,
            drainedAt: pendingMatches ? performance.now() : 0,
            lastAudibleAt: 0,
          };

          if (pendingMatches) {
            pendingDrainedBatchRef.current = null;
          }

          console.log("[PLAYBACK] Active batch registered:", {
            batch_id,
            turn_number,
            stage,
          });
        }
      }

      // Backend confirms that the final frame was consumed
      // by the server-side audio track.
      
if (payload.event === "audio.batch.drained") {
  const { batch_id, turn_number } = data;
  const activeBatch = activeBatchRef.current;

  if (!batch_id || !Number.isInteger(turn_number)) {
    console.warn("[PLAYBACK] Invalid drained event:", data);
  } else if (!activeBatch) {
    pendingDrainedBatchRef.current = {
      batchId: batch_id,
      turnNumber: turn_number,
    };
  } else if (
    activeBatch.batchId === batch_id &&
    activeBatch.turnNumber === turn_number
  ) {
    activeBatch.drained = true;
    activeBatch.drainedAt = performance.now();

    console.log("[PLAYBACK] Active batch drained:", batch_id);
  } else {
    console.warn("[PLAYBACK] Ignoring stale drained event:", {
      receivedBatchId: batch_id,
      activeBatchId: activeBatch.batchId,
      receivedTurn: turn_number,
      activeTurn: activeBatch.turnNumber,
    });
  }
}


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

  const SILENCE_DURATION = 1500;
  const AUDIO_THRESHOLD = 0.008;

  audio.srcObject = rtc.remoteStream;

  async function startPlaybackMonitor() {
    try {
      await audio.play();

      if (disposed) return;

      console.log("[PLAYBACK] Remote audio playback started");

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

        const batch = activeBatchRef.current;

        // No registered batch yet. Continue monitoring,
        // but don't generate playback events.
        if (!batch) {
          animationFrameId = requestAnimationFrame(monitorPlayback);
          return;
        }

        if (now - lastDebugAt >= 500) {
          console.log("[PLAYBACK DEBUG]", {
            batchId: batch.batchId,
            turnNumber: batch.turnNumber,
            rms: Number(rms.toFixed(5)),
            playbackStarted: batch.playbackStarted,
            drained: batch.drained,
            playbackFinished: batch.playbackFinished,
          });

          lastDebugAt = now;
        }

        // Detect actual AI audio activity.
        if (rms >= AUDIO_THRESHOLD) {
          batch.lastAudibleAt = now;

          if (!batch.playbackStarted) {
            const sent = rtc.sendEvent("ai.playback.started", {
              batch_id: batch.batchId,
              turn_number: batch.turnNumber,
            });

            console.log("[PLAYBACK] Started event send result:", sent);

            if (sent) {
              batch.playbackStarted = true;

              console.log("[PLAYBACK] AI playback started:", batch.batchId);
            }
          }
        }

        // Playback can finish only after:
        // 1. Actual audio activity was detected.
        // 2. The server confirmed the batch was drained.
        // 3. The audio has remained silent for the threshold duration.
        if (batch.playbackStarted && batch.drained && !batch.playbackFinished) {
          const silenceReference = Math.max(
            batch.lastAudibleAt,
            batch.drainedAt,
          );

          const silenceDuration = now - silenceReference;

          if (silenceDuration >= SILENCE_DURATION) {
            const sent = rtc.sendEvent("ai.playback.finished", {
              batch_id: batch.batchId,
              turn_number: batch.turnNumber,
            });

            console.log("[PLAYBACK] Finished event send result:", sent);

            if (sent) {
              batch.playbackFinished = true;

              console.log("[PLAYBACK] AI playback finished:", batch.batchId);
            }
          }
        }

        animationFrameId = requestAnimationFrame(monitorPlayback);
      }

      monitorPlayback();
    } catch (error) {
      if (!disposed) {
        console.error("[PLAYBACK] Failed to initialize audio monitor:", error);
      }
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
  <div className="flex min-h-screen flex-col bg-[#080D1A] font-sans text-white antialiased">
    {/* Header */}
    <header className="border-b border-white/10 bg-[#0B1120]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <AudioLines className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">Voxi</h1>
            <p className="text-xs text-slate-500">AI Interview Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-300">
            Interview session
          </span>
        </div>
      </div>
    </header>

    {/* Main interview area */}
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Live Interview
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Interview Room
          </h2>
        </div>

        <button
          type="button"
          onClick={end.openModal}
          className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10"
        >
          End Interview
        </button>
      </div>

      {/* Conversation state */}
      <div className="flex flex-1 items-center justify-center">
        <ConversationView
          state={session.conversationState}
          audioLevel={mic.level}
          errorMessage={mic.error || rtc.error || session.serverError}
          onViewResults={() => navigate(`/interviews/${interviewId}/results`)}
          onRetry={rtc.reconnect}
          onHome={() => navigate("/")}
        />
      </div>

      {/* Microphone status */}
      <div className="mt-8 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              mic.error
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            <Mic className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-200">
              {mic.error ? "Microphone unavailable" : "Microphone"}
            </p>
            <p className="text-xs text-slate-500">
              {mic.error
                ? "Check microphone permissions"
                : "Audio input status"}
            </p>
          </div>
        </div>
      </div>

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
