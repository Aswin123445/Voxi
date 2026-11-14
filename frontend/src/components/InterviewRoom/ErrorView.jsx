import { AlertCircle } from "lucide-react";

export default function ErrorView({ errorMessage, onRetry, onHome }) {
  return (
    <div className="w-full max-w-md animate-fadeIn space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-xs">
        <AlertCircle className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          Something went wrong
        </h1>
        <p className="text-sm text-[#64748B]">
          {errorMessage || "Your interview connection encountered a problem."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] shadow-xs hover:bg-[#F8FAFC]"
        >
          Retry Connection
        </button>
        <button
          type="button"
          onClick={onHome}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-medium text-white shadow-xs hover:bg-[#1D4ED8]"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
