export default function PageIntro({ interviewId }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
          You're almost ready.
        </h1>
        <p className="mt-1.5 text-base text-[#64748B]">
          Take a moment to prepare your environment before starting your AI
          interview.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 self-start rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 shadow-xs">
        <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
        <span className="text-xs font-medium text-[#0F172A]">
          Interview created
        </span>
        <span className="text-xs text-[#94A3B8]">
          #{interviewId?.slice(0, 8) || "sess_active"}
        </span>
      </div>
    </div>
  );
}
