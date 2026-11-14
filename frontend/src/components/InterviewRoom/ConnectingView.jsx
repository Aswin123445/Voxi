import { Radio, Loader2 } from "lucide-react";

export default function ConnectingView() {
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-[#2563EB] shadow-xs">
        <Radio className="h-8 w-8 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          Connecting to your interviewer
        </h1>
        <p className="mx-auto max-w-md text-sm text-[#64748B]">
          Please wait while we establish your interview connection.
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
      </div>
    </div>
  );
}
