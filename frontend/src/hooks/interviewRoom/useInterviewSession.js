import { useMemo } from "react";
import { ConnectionState, ConversationState } from "../../utils/constants";

export function useInterviewSession({
  rtcConnectionState = "new",
  rtcError = "",
  micError = "",
} = {}) {
  const connectionState = useMemo(() => {
    if (rtcConnectionState === "connected") {
      return ConnectionState.CONNECTED;
    }

    if (
      rtcConnectionState === "disconnected" ||
      rtcConnectionState === "failed" ||
      rtcConnectionState === "closed"
    ) {
      return ConnectionState.DISCONNECTED;
    }

    return ConnectionState.CONNECTING;
  }, [rtcConnectionState]);

  const conversationState =
    micError || rtcError
      ? ConversationState.ERROR
      : ConversationState.CONNECTING;

  return {
    connectionState,
    conversationState,
  };
}
