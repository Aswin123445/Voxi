import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { startInterviewApi } from "../../api/interviewApi";
import { useAudioStream } from "../../context/AudioStreamContext";

export function useStartInterview({ interviewId, stream, onStreamLost }) {
  const navigate = useNavigate();
  const { setStream } = useAudioStream();

  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const start = useCallback(async () => {
    if (isStarting) return;

    const streamIsLive =
      stream &&
      stream.getAudioTracks().length > 0 &&
      stream.getAudioTracks().every((track) => track.readyState === "live");

    if (!streamIsLive) {
      setError(
        "Your microphone connection was lost. Please re-test your microphone.",
      );

      onStreamLost?.();
      return;
    }

    setIsStarting(true);
    setError("");

    try {
      await startInterviewApi(interviewId);

      // Preserve the existing microphone stream for the interview room.
      setStream(stream);

      navigate(`/interviews/${interviewId}/room`);
    } catch (err) {
      console.error("Failed to start interview:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to start interview session. Please try again.",
      );

      setIsStarting(false);
    }
  }, [interviewId, isStarting, navigate, onStreamLost, setStream, stream]);

  return {
    start,
    isStarting,
    error,
  };
}
