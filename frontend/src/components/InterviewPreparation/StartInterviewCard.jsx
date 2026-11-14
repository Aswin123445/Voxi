import { AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function StartInterviewCard({
  isReady,
  onReadyChange,
  canStart,
  isStarting,
  error,
  onStart,
}) {
  return (
    <div className="space-y-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
      <label className="group flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={isReady}
          onChange={(e) => onReadyChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
        <span className="select-none text-sm font-medium text-[#0F172A] transition-colors group-hover:text-[#2563EB]">
          I've checked my devices and I'm ready to begin.
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">
            Ready to begin?
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Once you start, your AI interview session will begin.
          </p>
        </div>

        <button
          type="button"
          onClick={onStart}
          disabled={!canStart || isStarting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
        >
          {isStarting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Starting interview...</span>
            </>
          ) : (
            <>
              <span>Start Interview</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
