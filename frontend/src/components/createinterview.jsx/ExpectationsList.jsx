import { Mic, Code2, FileCheck2, Clock } from "lucide-react";
const EXPECTATIONS = [
  {
    step: "01",
    icon: Mic,
    title: "Real-time conversation",
    description: "Interact naturally with an AI interviewer through voice.",
  },
  {
    step: "02",
    icon: Code2,
    title: "Technical assessment",
    description:
      "Demonstrate your Python development knowledge and problem-solving skills.",
  },
  {
    step: "03",
    icon: FileCheck2,
    title: "Personalized feedback",
    description: "Receive an evaluation of your interview performance.",
  },
];
function ExpectationsList() {
  return (
    <div className="mt-9 border-t border-slate-200/80 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          What to expect
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          ~15 min session
        </span>
      </div>

      <ol className="relative mt-6 space-y-6">
        {EXPECTATIONS.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === EXPECTATIONS.length - 1;
          return (
            <li key={item.title} className="relative flex items-start gap-4">
              {/* Subtle vertical connector line between steps */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[17px] top-9 -bottom-6 w-px bg-slate-200"
                />
              )}

              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-blue-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </div>

              <div className="pt-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <span className="font-mono text-[11px] font-medium text-slate-400">
                    {item.step}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
export default ExpectationsList;
