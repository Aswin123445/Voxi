import { Lock } from "lucide-react";
import { FIXED_JOB_ROLE } from "../../utils/constants";

export default function InterviewSummaryCard() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
        Interview Summary
      </h2>
      <div className="mt-4 space-y-3.5 divide-y divide-[#F1F5F9]">
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-[#64748B]">Position</span>
          <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
            <span>{FIXED_JOB_ROLE}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[11px] text-[#64748B]">
              <Lock className="h-3 w-3" />
              Fixed
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3.5">
          <span className="text-sm text-[#64748B]">Interview type</span>
          <span className="text-sm font-medium text-[#0F172A]">
            AI Voice Interview
          </span>
        </div>
        <div className="flex items-center justify-between pt-3.5">
          <span className="text-sm text-[#64748B]">Format</span>
          <span className="text-sm font-medium text-[#0F172A]">
            Real-time conversation
          </span>
        </div>
      </div>
    </div>
  );
}
