import { ShieldAlert, Loader2 } from "lucide-react";

export default function EndInterviewModal({
  open,
  isEnding,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#0F172A]">
              End this interview session?
            </h3>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Ending the interview will terminate your current session, close
              active WebRTC and WebSocket connections, and submit your
              responses for evaluation.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isEnding}
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isEnding}
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white shadow-xs hover:bg-red-700 disabled:opacity-70"
          >
            {isEnding && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Yes, End Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
