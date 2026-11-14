import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useEndInterview({ interviewId, stream }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const confirm = useCallback(async () => {
    setIsEnding(true);
    try {
      stream?.getTracks().forEach((t) => t.stop());
      // await apiClient.post(`/interviews/${interviewId}/end`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulated
    } catch (err) {
      console.error("Failed to end interview cleanly:", err);
    }
    navigate(`/interviews/${interviewId}/results`);
  }, [interviewId, navigate, stream]);

  return { isModalOpen, isEnding, openModal, closeModal, confirm };
}
