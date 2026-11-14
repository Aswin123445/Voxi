import { ConversationState } from "../../utils/constants";

/** Development-only controls. Remove or gate behind a dev flag before shipping. */
export default function StateSimulator({ activeState, onChange, onNextStage }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#CBD5E1] bg-white/60 p-3.5 text-xs">
      <span className="font-medium text-[#64748B]">
        Simulate Conversation State:
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {Object.values(ConversationState).map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => onChange(state)}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              activeState === state
                ? "bg-[#2563EB] text-white shadow-xs"
                : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
          >
            {state}
          </button>
        ))}
        <button
          type="button"
          onClick={onNextStage}
          className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
        >
          Next Stage ⏭
        </button>
      </div>
    </div>
  );
}
