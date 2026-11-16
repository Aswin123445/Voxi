import { AlertCircle, RefreshCw, Home, WifiOff } from "lucide-react";

export default function ErrorView({ errorMessage, onRetry, onHome }) {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-red-950/20 backdrop-blur-xl">
      {/* Error icon */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-gradient-to-br from-red-500/20 to-rose-500/20 text-red-300 shadow-lg shadow-red-500/10">
          <WifiOff className="h-8 w-8" />
        </div>
      </div>

      {/* Error message */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium tracking-wide text-red-300">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>CONNECTION ERROR</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-400">
          {errorMessage ||
            "Your interview connection encountered a problem. Please try connecting again."}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onRetry}
          className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-400 hover:to-indigo-400 active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
          <span>Retry Connection</span>
        </button>

        <button
          type="button"
          onClick={onHome}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Home className="h-4 w-4" />
          <span>Return Home</span>
        </button>
      </div>

      <p className="text-xs text-slate-500">
        If the problem persists, please check your internet connection.
      </p>
    </div>
  );
}
