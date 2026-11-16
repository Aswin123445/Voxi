import { Volume2, Sparkles, AudioLines } from "lucide-react";

const BAR_HEIGHTS = [
  30, 55, 80, 45, 95, 65, 35, 75, 100, 55, 85, 40, 70, 95, 45, 60, 35,
];

export default function AiSpeakingView() {
  return (
    <div className="w-full max-w-2xl animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#101827] px-6 py-12 text-center shadow-2xl shadow-slate-900/10 sm:px-12 sm:py-16">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 space-y-9">
          {/* Status */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-medium tracking-wide text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              INTERVIEWER SPEAKING
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            </div>
          </div>

          {/* AI audio orb */}
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full border border-violet-400/20 [animation-duration:3s]" />

            <div className="absolute inset-3 rounded-full border border-violet-400/20" />

            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/20 blur-xl" />

            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-violet-300/30 bg-gradient-to-br from-violet-500 to-indigo-700 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
              <Volume2 className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              AI Interviewer
            </h1>

            <p className="text-sm leading-6 text-slate-400 sm:text-base">
              Listen carefully to the question. You can respond when the
              interviewer finishes speaking.
            </p>
          </div>

          {/* Audio waveform */}
          <div className="mx-auto flex h-20 max-w-md items-center justify-center gap-1.5 rounded-2xl border border-white/5 bg-white/[0.03] px-5">
            {BAR_HEIGHTS.map((height, index) => (
              <span
                key={index}
                className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-violet-300 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.5 + (index % 5) * 0.15}s`,
                  animationDelay: `${index * 0.06}s`,
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <AudioLines className="h-4 w-4 text-violet-400" />
            <span>Please wait while the question is being played</span>
          </div>
        </div>
      </div>
    </div>
  );
}
