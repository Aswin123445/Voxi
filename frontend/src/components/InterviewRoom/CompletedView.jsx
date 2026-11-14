import { CheckCircle2, ArrowRight } from "lucide-react";

export default function CompletedView({ onViewResults }) {
  return (
    <div className="w-full max-w-md animate-fadeIn space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-green-600 shadow-xs">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          Interview completed
        </h1>
        <p className="text-sm text-[#64748B]">
          Thank you for completing your interview.
        </p>
      </div>

      <button
        type="button"
        onClick={onViewResults}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-[#1D4ED8]"
      >
        <span>View Interview Results</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
