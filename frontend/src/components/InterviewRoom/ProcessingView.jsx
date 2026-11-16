import { Brain, Loader2, Sparkles } from "lucide-react";

export default function ProcessingView() {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-blue-950/20 backdrop-blur-xl">
      {/* Animated AI icon */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-300 shadow-lg shadow-blue-500/10">
          <Brain className="h-8 w-8 animate-pulse" />
        </div>
      </div>

      {/* Status and heading */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium tracking-wide text-blue-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>AI PROCESSING</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Analyzing your response
        </h1>

        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400">
          Our AI interviewer is evaluating your answer and preparing the next
          question.
        </p>
      </div>

      {/* Processing animation */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className="h-8 w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-indigo-400 animate-pulse"
              style={{
                animationDelay: `${item * 150}ms`,
                animationDuration: "900ms",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Generating insights from your response</span>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Please wait. Your interview will continue shortly.
      </p>
    </div>
  );
}
