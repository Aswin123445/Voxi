from app.enums.interview_stage import InterviewStage


class QuestionGenerator:

    def __init__(self):
        self.questions = {
            InterviewStage.INTRODUCTION: [
                "Welcome to your first-round interview. "
                "Tell me about your past experience."
            ],
            InterviewStage.EXPERIENCE: [
                "Now let's move on to your experience. "
                "Describe your experience with backend development."
            ],
            InterviewStage.TECHNICAL: [
                "Thank you for sharing your answer. Let's move on to the next question. "
                "Explain how Python handles memory management."
            ],
            InterviewStage.EXPECTED_SALARY: ["Finally what are your salary expectations?"],
        }

    def generate(self, stage: InterviewStage) -> str:
        questions = self.questions.get(stage)

        if not questions:
            raise ValueError(f"No questions configured for stage: {stage}")

        return questions[0]
