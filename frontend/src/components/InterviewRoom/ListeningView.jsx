import { Mic } from "lucide-react";

const BASE_HEIGHTS = [25, 45, 70, 95, 60, 80, 50, 90, 65, 40];

export default function ListeningView({ audioLevel }) {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-green-600 shadow-xs">
        <Mic className="h-7 w-7 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          <span className="h-2 w-2 animate-ping rounded-full bg-green-600" />
          <span>Microphone active</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          Your turn to speak
        </h1>
        <p className="text-sm text-[#64748B]">
          Speak naturally. We're listening.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div className="flex h-12 w-full items-center justify-center gap-1.5">
          {BASE_HEIGHTS.map((base, i) => {
            const dynamic = Math.min(
              100,
              Math.max(15, base * (audioLevel / 50 + 0.3)),
            );
            return (
              <span
                key={i}
                className="w-1.5 rounded-full bg-green-500 transition-all duration-75"
                style={{ height: `${audioLevel > 2 ? dynamic : 20}%` }}
              />
            );
          })}
        </div>
        <span className="text-xs font-medium text-[#64748B]">
          Audio input level: {audioLevel}%
        </span>
      </div>
    </div>
  );
}
