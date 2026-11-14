import { Mic, MicOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const ICON_STYLES = {
  success: "border-green-200 bg-green-50 text-green-600",
  error: "border-red-200 bg-red-50 text-red-600",
  default: "border-[#E2E8F0] bg-white text-[#2563EB]",
};

export default function MicrophoneCheck({ status, error, level, onTest }) {
  const iconStyle = ICON_STYLES[status] ?? ICON_STYLES.default;
  const Icon = status === "error" ? MicOff : Mic;

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconStyle}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#0F172A]">Microphone</h3>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Make sure your microphone can capture your voice.
            </p>

            <div className="mt-2 flex items-center gap-2">
              {status === "idle" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Not tested
                </span>
              )}
              {status === "requesting" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Requesting permission...
                </span>
              )}
              {status === "success" && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready & working
                  </span>
                  <div className="hidden items-center gap-1 sm:flex">
                    <span className="text-[10px] text-[#64748B]">Level:</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-green-500 transition-all duration-75"
                        style={{ width: `${Math.max(10, level)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {status === "error" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Check failed
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onTest}
          disabled={status === "requesting"}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-xs font-medium text-[#0F172A] shadow-xs transition-colors hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "success" ? "Re-test microphone" : "Test microphone"}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
