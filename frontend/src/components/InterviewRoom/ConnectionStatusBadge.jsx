import { Loader2 } from "lucide-react";
import { ConnectionState } from "../../utils/constants";

export default function ConnectionStatusBadge({ state }) {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs sm:flex">
      {state === ConnectionState.CONNECTED && (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#16A34A]" />
          <span className="font-medium text-[#0F172A]">Connected</span>
        </>
      )}
      {state === ConnectionState.CONNECTING && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-[#2563EB]" />
          <span className="font-medium text-[#2563EB]">Connecting...</span>
        </>
      )}
      {state === ConnectionState.RECONNECTING && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
          <span className="font-medium text-amber-600">Reconnecting</span>
        </>
      )}
      {state === ConnectionState.DISCONNECTED && (
        <>
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="font-medium text-red-600">Disconnected</span>
        </>
      )}
    </div>
  );
}
