import { Volume2, CheckCircle2, Loader2 } from "lucide-react";

export default function AudioOutputCheck({ status, onTest }) {
  const iconStyle =
    status === "confirmed"
      ? "border-green-200 bg-green-50 text-green-600"
      : "border-[#E2E8F0] bg-white text-[#2563EB]";

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconStyle}`}
          >
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#0F172A]">Audio output</h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Check whether you can hear the AI interviewer.
            </p>

            <div className="mt-2 flex items-center gap-2">
              {status === "idle" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Not tested
                </span>
              )}
              {status === "playing" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Playing test sound...
                </span>
              )}
              {status === "confirmed" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Audio confirmed
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onTest}
          disabled={status === "playing"}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-medium text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "confirmed" ? "Test again" : "Test audio"}
        </button>
      </div>
    </div>
  );
}
