from app.enums.interview_stage import InterviewStage


class QuestionGenerator:

    def __init__(self):
        self.questions = {
            InterviewStage.INTRODUCTION: [
                "Welcome to your first-round interview. "
                "Tell me about your past experience."
            ],
            InterviewStage.EXPERIENCE: [
                "Describe your experience with backend development."
            ],
            InterviewStage.TECHNICAL: ["Explain how Python handles memory management."],
            InterviewStage.EXPECTED_SALARY: ["What are your salary expectations?"],
        }

    def generate(self, stage: InterviewStage) -> str:
        questions = self.questions.get(stage)

        if not questions:
            raise ValueError(f"No questions configured for stage: {stage}")

        return questions[0]
