import { ShieldAlert, Loader2, X, AlertTriangle } from "lucide-react";

export default function EndInterviewModal({
  open,
  isEnding,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-400">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">
                End this interview?
              </h3>

              <p className="text-sm leading-relaxed text-slate-400">
                Are you sure you want to end your current interview session?
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isEnding}
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="flex gap-3 rounded-xl border border-red-400/10 bg-red-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

          <p className="text-xs leading-relaxed text-slate-400">
            Ending the interview will close your active session. Your submitted
            responses will be handled according to the interview evaluation
            process.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isEnding}
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue Interview
          </button>

          <button
            type="button"
            disabled={isEnding}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEnding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ending Interview...
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4" />
                End Interview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
