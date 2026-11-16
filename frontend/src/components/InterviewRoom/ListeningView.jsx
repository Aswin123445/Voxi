import { Mic, AudioLines, Activity } from "lucide-react";

const BASE_HEIGHTS = [
  25, 45, 70, 95, 60, 80, 50, 90, 65, 40, 75, 55, 85, 35, 65, 95, 45,
];

export default function ListeningView({ audioLevel = 0 }) {
  const normalizedLevel = Math.min(100, Math.max(0, audioLevel || 0));
  const isSpeaking = normalizedLevel > 2;

  return (
    <div className="w-full max-w-2xl animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#101827] px-6 py-12 text-center shadow-2xl shadow-slate-900/10 sm:px-12 sm:py-16">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 space-y-9">
          {/* Status */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium tracking-wide text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              MICROPHONE ACTIVE
            </div>
          </div>

          {/* Microphone orb */}
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border border-emerald-400/20 transition-transform duration-150"
              style={{
                transform: `scale(${1 + normalizedLevel / 500})`,
              }}
            />

            <div className="absolute inset-3 rounded-full border border-emerald-400/20" />

            <div
              className="absolute inset-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 blur-xl transition-opacity duration-150"
              style={{ opacity: 0.4 + normalizedLevel / 170 }}
            />

            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/30 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_50px_rgba(16,185,129,0.25)] transition-transform duration-100"
              style={{
                transform: `scale(${1 + normalizedLevel / 700})`,
              }}
            >
              <Mic className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your turn to speak
            </h1>

            <p className="text-sm leading-6 text-slate-400 sm:text-base">
              Speak naturally and take your time. The interviewer is listening
              to your response.
            </p>
          </div>

          {/* Audio visualization */}
          <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <div className="flex h-16 items-center justify-center gap-1.5">
              {BASE_HEIGHTS.map((base, index) => {
                const dynamicHeight = Math.max(
                  12,
                  Math.min(100, base * (0.25 + normalizedLevel / 35)),
                );

                return (
                  <span
                    key={index}
                    className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600 to-cyan-300 transition-all duration-75"
                    style={{
                      height: `${isSpeaking ? dynamicHeight : 12}%`,
                      opacity: isSpeaking ? 1 : 0.35,
                    }}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-400">
                <Activity className="h-4 w-4 text-emerald-400" />
                Audio input level
              </span>

              <span className="font-medium tabular-nums text-emerald-300">
                {Math.round(normalizedLevel)}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100"
                style={{ width: `${normalizedLevel}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <AudioLines className="h-4 w-4 text-emerald-400" />
            <span>
              {isSpeaking
                ? "Your voice is being captured"
                : "Waiting for your response"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
