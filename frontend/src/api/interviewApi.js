import api from "./axios";

export const createInterview = async (data) => {
  const response = await api.post("/api/v1/interviews/", data);

  return response.data;
};
export const startInterviewApi = async (interviewId) => {
  const response = await api.post(`/api/v1/interviews/${interviewId}/start`);

  return response.data;
};
