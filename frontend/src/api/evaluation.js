import api from "./axios";

export const getInterviewResults = async (interviewId) => {
  const response = await api.get(`/api/v1/interviews/${interviewId}/results`);

  return response.data;
};
