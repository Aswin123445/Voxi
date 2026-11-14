import { useState } from "react";
import { useParams } from "react-router-dom";
import InterviewSummaryCard from "../components/InterviewPreparation/InterviewSummaryCard";
import PageIntro from "../components/InterviewPreparation/PageIntro";
import GuidelinesCard from "../components/InterviewPreparation/GuidelinesCard";
import StartInterviewCard from "../components/InterviewPreparation/StartInterviewCard";
import DeviceReadinessCard from "../components/InterviewPreparation/DeviceReadinessCard";
import { useMicrophoneCheck } from "../hooks/interviewPreparation/useMicrophoneCheck";
import { useAudioOutputTest } from "../hooks/interviewPreparation/useAudioOutputTest";
import { useStartInterview } from "../hooks/interviewPreparation/useStartInterview";

export default function InterviewPreparation() {
  const { interviewId } = useParams();
  const [isReady, setIsReady] = useState(false);

  const mic = useMicrophoneCheck();
  const speaker = useAudioOutputTest();
  const { start, isStarting, error } = useStartInterview({
    interviewId,
    stream: mic.stream,
    onStreamLost: mic.reset,
  });

  const canStart =
    mic.status === "success" && speaker.status === "confirmed" && isReady;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased">
      <main className="mx-auto max-w-[1100px] px-4 py-4 sm:px-6 sm:py-14 lg:px-8 lg:py-4">
        <PageIntro interviewId={interviewId} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-5">
            <InterviewSummaryCard />
            <GuidelinesCard />
          </div>

          <div className="space-y-6 lg:col-span-7">
            <DeviceReadinessCard mic={mic} speaker={speaker} />
            <StartInterviewCard
              isReady={isReady}
              onReadyChange={setIsReady}
              canStart={canStart}
              isStarting={isStarting}
              error={error}
              onStart={start}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
