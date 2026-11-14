import {
  AudioWaveform,
} from "lucide-react";
function Navbar() {
  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Voxi Emblem & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(15,23,42,0.12)]">
              <AudioWaveform
                className="h-4 w-4 text-blue-400"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-slate-900">
              Voxi
            </span>
          </div>

          <span
            className="hidden h-4 w-px bg-slate-200 sm:inline-block"
            aria-hidden="true"
          />

          <span className="hidden text-xs font-medium text-slate-500 sm:inline">
            AI Interview Platform
          </span>
        </div>

        {/* Right: Minimal Status Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 sm:hidden">
            AI Interview Platform
          </span>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-2.5 py-1 shadow-[0_1px_1px_rgba(15,23,42,0.02)]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span className="text-xs font-medium text-slate-700">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;