import { useMemo, useState, useCallback } from "react";
import { ConnectionState, ConversationState } from "../../utils/constants";

const RUNTIME_STATUSES = [
  "AI_SPEAKING",
  "LISTENING",
  "CANDIDATE_SPEAKING",
  "PROCESSING",
];

export function useInterviewSession({
  rtcConnectionState = "new",
  rtcError = "",
  micError = "",
} = {}) {
  const [runtimeStatus, setRuntimeStatus] = useState(null);
  const [turnNumber, setTurnNumber] = useState(null);
  const [stage, setStage] = useState(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [serverError, setServerError] = useState("");

  // Derive WebRTC connection state.
  const connectionState = useMemo(() => {
    if (rtcConnectionState === "connected") {
      return ConnectionState.CONNECTED;
    }

    if (["disconnected", "failed", "closed"].includes(rtcConnectionState)) {
      return ConnectionState.DISCONNECTED;
    }

    return ConnectionState.CONNECTING;
  }, [rtcConnectionState]);

  // Handle events received from the backend.
  const handleInterviewEvent = useCallback((payload) => {
    if (!payload?.event) {
      console.warn("[SESSION] Invalid interview event:", payload);
      return;
    }

    const { event, data = {} } = payload;

    console.log("[SESSION] Processing event:", event, data);

    switch (event) {
      case "interview.started":
      case "question.audio.queued": {
        if (data.turn_number !== undefined) {
          setTurnNumber(data.turn_number);
        }

        if (data.stage !== undefined) {
          setStage(data.stage);
        }

        break;
      }

      case "interview.status": {
        const { status, turn_number, stage } = data;

        if (!RUNTIME_STATUSES.includes(status)) {
          console.warn("[SESSION] Unknown runtime status:", status);
          return;
        }

        setRuntimeStatus(status);

        if (turn_number !== undefined) {
          setTurnNumber(turn_number);
        }

        if (stage !== undefined) {
          setStage(stage);
        }

        break;
      }

      case "candidate.processing":
      case "interview.evaluating": {
        setRuntimeStatus("PROCESSING");

        if (data.turn_number !== undefined) {
          setTurnNumber(data.turn_number);
        }

        if (data.stage !== undefined) {
          setStage(data.stage);
        }

        break;
      }

      case "interview.completed": {
        setIsCompleted(true);
        setCompletionData(data);
        setRuntimeStatus(null);
        setServerError("");

        console.log("[SESSION] Interview completed:", data);
        break;
      }

      case "error": {
        setServerError(
          data.message || payload.message || "An interview error occurred.",
        );

        console.error("[SESSION] Backend error:", data);
        break;
      }

      default:
        console.log("[SESSION] Event received:", event);
    }
  }, []);

  // Derive conversation state.
  const conversationState = useMemo(() => {
    if (isCompleted) {
      return ConversationState.COMPLETED;
    }

    if (micError || rtcError || serverError) {
      return ConversationState.ERROR;
    }

    switch (runtimeStatus) {
      case "AI_SPEAKING":
        return ConversationState.AI_SPEAKING;

      case "LISTENING":
        return ConversationState.LISTENING;

      case "CANDIDATE_SPEAKING":
        return ConversationState.CANDIDATE_SPEAKING;

      case "PROCESSING":
        return ConversationState.PROCESSING;

      default:
        return ConversationState.CONNECTING;
    }
  }, [isCompleted, micError, rtcError, serverError, runtimeStatus]);

  return {
    connectionState,
    conversationState,
    runtimeStatus,
    turnNumber,
    stage,
    isCompleted,
    completionData,
    serverError,
    handleInterviewEvent,
  };
}
