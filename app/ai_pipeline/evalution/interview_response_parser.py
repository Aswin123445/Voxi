import json

from pydantic import ValidationError

from app.ai_pipeline.evalution.interview_evaluation_schema import (
    InterviewEvaluationResult,
)


class InterviewResponseParser:

    def parse(self, raw_response: str) -> InterviewEvaluationResult:

        try:
            response_data = json.loads(raw_response)

            return InterviewEvaluationResult.model_validate(response_data)

        except json.JSONDecodeError as exc:
            raise ValueError("LLM returned invalid interview evaluation JSON.") from exc

        except ValidationError as exc:
            raise ValueError(f"Invalid interview evaluation response: {exc}") from exc
