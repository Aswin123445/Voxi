export const FIXED_JOB_ROLE = "Python Developer";

export const GUIDELINES = [
  {
    title: "Find a quiet place",
    description: "Choose an environment with minimal background noise.",
  },
  {
    title: "Speak naturally",
    description: "Answer clearly and explain your thoughts where necessary.",
  },
  {
    title: "Keep your microphone enabled",
    description:
      "Allow microphone access and keep it active throughout the interview.",
  },
  {
    title: "Stay on the interview page",
    description:
      "Avoid refreshing or closing the tab during the interview session.",
  },
];

export const ConversationState = {
  CONNECTING: "CONNECTING",
  AI_SPEAKING: "AI_SPEAKING",
  LISTENING: "LISTENING",
  CANDIDATE_SPEAKING: "CANDIDATE_SPEAKING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
};

export const ConnectionState = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  RECONNECTING: "RECONNECTING",
};

export const STAGES = [
  "INTRODUCTION",
  "EXPERIENCE",
  "TECHNICAL",
  "EXPECTED_SALARY",
];

export const STAGE_LABELS = {
  INTRODUCTION: "Introduction",
  EXPERIENCE: "Experience",
  TECHNICAL: "Technical",
  EXPECTED_SALARY: "Expected Salary",
};

export const STAGE_ORDER = [...STAGES];
