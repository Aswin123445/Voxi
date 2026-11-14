import MicrophoneCheck from "../InterviewPreparation/MicrophoneCheck";
import AudioOutputCheck from "../InterviewPreparation/AudioOutputCheck";

export default function DeviceReadinessCard({ mic, speaker }) {
  return (
    <div className="space-y-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#0F172A]">
          Device readiness check
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Verify your microphone and speakers are working correctly before
          starting.
        </p>
      </div>

      <MicrophoneCheck
        status={mic.status}
        error={mic.error}
        level={mic.level}
        onTest={mic.test}
      />
      <AudioOutputCheck status={speaker.status} onTest={speaker.test} />
    </div>
  );
}
