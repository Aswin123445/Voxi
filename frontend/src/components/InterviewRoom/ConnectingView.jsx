import { Radio, Loader2, ShieldCheck } from "lucide-react";

export default function ConnectingView() {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
      {/* Connection animation */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full border border-blue-400/20" />

        <div className="absolute inset-2 rounded-full bg-blue-500/20 blur-xl" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-300 shadow-lg shadow-blue-500/10">
          <Radio className="h-8 w-8 animate-pulse" />
        </div>
      </div>

      {/* Connection status */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium tracking-wide text-blue-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>ESTABLISHING CONNECTION</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Connecting to your interviewer
        </h1>

        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400">
          We're setting up your audio connection. This should only take a
          moment.
        </p>
      </div>

      {/* Connection steps */}
      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-left">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          <span>Establishing secure session</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Radio className="h-4 w-4" />
          <span>Preparing real-time audio connection</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          <span>Preparing interview environment</span>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Please keep this window open while we connect.
      </p>
    </div>
  );
}
