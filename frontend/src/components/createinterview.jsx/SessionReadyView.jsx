import { useState } from "react";
import {
    Lock,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Volume2,
} from "lucide-react";

import Button from "./Button";
const FIXED_JOB_ROLE = "Python Developer";

function SessionReadyView({ formData, sessionCode, onEditDetails }) {
  const [micVerified, setMicVerified] = useState(false);
  const [roomEntered, setRoomEntered] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Interview session ready
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your session has been configured. Verify your audio before
              beginning.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate & Session Metadata Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2.5 text-xs">
          <span className="font-medium text-slate-500">Session ID</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700">
            {sessionCode}
          </span>
        </div>

        <div className="divide-y divide-slate-200/80">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-slate-500">Candidate</span>
            <span className="font-medium text-slate-900">
              {formData.fullName.trim()}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">
              {formData.email.trim()}
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-slate-500">Position</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
              {FIXED_JOB_ROLE}
              <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Audio Check Row */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
              micVerified
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {micVerified ? "Audio check passed" : "Quick audio check"}
            </p>
            <p className="text-xs text-slate-500">
              {micVerified
                ? "Microphone and speakers are ready."
                : "Confirm your microphone is unmuted."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMicVerified((prev) => !prev)}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            micVerified
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {micVerified ? "Ready" : "Confirm"}
        </button>
      </div>

      {roomEntered && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-blue-900">
          Preparation room route ready:{" "}
          <span className="font-mono font-medium">
            /interviews/{sessionCode}/prepare
          </span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={onEditDetails}
          className="sm:w-auto sm:flex-1"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Edit details</span>
        </Button>

        <Button
          type="button"
          onClick={() => setRoomEntered(true)}
          className="sm:flex-[1.4]"
        >
          <span>Continue to Preparation</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}

export default SessionReadyView;
export { FIXED_JOB_ROLE };