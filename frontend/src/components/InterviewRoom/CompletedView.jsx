
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function CompletedView({ onViewResults }) {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">

      {/* Success icon */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-9 w-9" />
        </div>
      </div>

      {/* Completion message */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>INTERVIEW COMPLETED</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Well done!
        </h1>

        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400">
          You've successfully completed your interview.
        </p>
      </div>

      {/* Results action */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onViewResults}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition-all hover:from-emerald-400 hover:to-teal-400 hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          <span>View Interview Results</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-xs text-slate-500">
          Your interview performance and feedback are ready to review.
        </p>
      </div>
    </div>
  );
}
