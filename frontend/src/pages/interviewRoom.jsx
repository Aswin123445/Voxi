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

  const { interviewId } = useParams();
  const navigate = useNavigate();

  const { stream } = useAudioStream();
  console.log("[ROOM] Interview ID:", interviewId);
  console.log("[ROOM] Context stream:", stream);
  console.log("[ROOM] Context audio tracks:", stream?.getAudioTracks());

  const mic = useRoomMicrophone(stream);

  const rtc = useWebRTC({
    interviewId,
    stream: mic.stream,
  });

  const session = useInterviewSession({
    rtcConnectionState: rtc.connectionState,
    rtcError: rtc.error,
    micError: mic.error,
  });

  const end = useEndInterview({
    interviewId,
    stream: mic.stream,
  });

  useEffect(() => {
    const audio = remoteAudioRef.current;

    if (!audio) return;

    audio.srcObject = rtc.remoteStream;

    if (rtc.remoteStream) {
      audio.play().catch((error) => {
        console.warn("Audio playback requires user interaction:", error);
      });
    }

    return () => {
      audio.pause();
      audio.srcObject = null;
    };
  }, [rtc.remoteStream]);

  return (
    <div className="flex min-h-screen select-none flex-col bg-[#F8FAFC] font-sans text-[#0F172A] antialiased">
      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col justify-between px-4 py-2 sm:px-6 sm:py-12">
        <ConversationView
          state={session.conversationState}
          audioLevel={mic.level}
          errorMessage={mic.error || rtc.error}
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
