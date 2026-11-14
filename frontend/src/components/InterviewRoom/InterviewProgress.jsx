import { STAGES } from "../../utils/constants";

export default function InterviewProgress({ currentIndex }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
          Interview Progress
        </span>
        <span className="text-xs font-medium text-[#0F172A]">
          Stage {currentIndex + 1} of {STAGES.length}: {STAGES[currentIndex]}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={stage} className="space-y-1.5">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  isCompleted
                    ? "bg-[#16A34A]"
                    : isCurrent
                      ? "bg-[#2563EB]"
                      : "bg-[#E2E8F0]"
                }`}
              />
              <span
                className={`block truncate text-[11px] font-medium ${
                  isCurrent ? "text-[#0F172A]" : "text-[#64748B]"
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
