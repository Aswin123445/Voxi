import { Volume2, Sparkles } from "lucide-react";

const BAR_HEIGHTS = [40, 75, 30, 90, 60, 45, 85, 50, 70, 35, 95, 60, 40];

export default function AiSpeakingView() {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 text-purple-600 shadow-xs">
        <Volume2 className="h-7 w-7 animate-bounce" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interviewer speaking</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          AI is speaking
        </h1>
        <p className="text-sm text-[#64748B]">
          Please listen to the interviewer.
        </p>
      </div>

      <div className="flex h-16 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
        {BAR_HEIGHTS.map((height, i) => (
          <span
            key={i}
            className="w-1.5 animate-pulse rounded-full bg-purple-600"
            style={{
              height: `${height}%`,
              animationDuration: `${0.6 + (i % 3) * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
