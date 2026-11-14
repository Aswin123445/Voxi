import { GUIDELINES } from "../../utils/constants";

export default function GuidelinesCard() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
        Before you begin
      </h2>
      <ul className="mt-4 space-y-4">
        {GUIDELINES.map((guide, idx) => (
          <li key={guide.title} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-semibold text-[#2563EB]">
              {idx + 1}
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#0F172A]">
                {guide.title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
                {guide.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
