import { Brain, Loader2 } from "lucide-react";

export default function ProcessingView() {
  return (
    <div className="w-full max-w-lg animate-fadeIn space-y-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-[#2563EB] shadow-xs">
        <Brain className="h-7 w-7 animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[#2563EB]">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Evaluating response</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          Processing your response
        </h1>
        <p className="text-sm text-[#64748B]">
          Please wait while we prepare the next question.
        </p>
      </div>

      <div className="flex h-16 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#2563EB] [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#2563EB] [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#2563EB]" />
      </div>
    </div>
  );
}
