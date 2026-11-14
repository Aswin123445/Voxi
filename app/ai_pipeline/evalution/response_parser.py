import json

from pydantic import ValidationError

from app.ai_pipeline.evalution.evaluation_schema import LLMEvaluationResponse



class ResponseParser:

    def parse(
        self,
        raw_response: str,
        expected_criteria: list[str],
    ) -> LLMEvaluationResponse:

        try:
            response_data = json.loads(raw_response)

            evaluation = LLMEvaluationResponse.model_validate(response_data)

            actual_criteria = [finding.criterion for finding in evaluation.findings]

            if len(actual_criteria) != len(set(actual_criteria)):
                raise ValueError("Duplicate evaluation criteria.")

            if set(actual_criteria) != set(expected_criteria):
                raise ValueError("LLM returned missing or unexpected criteria.")

            return evaluation

        except json.JSONDecodeError as exc:
            raise ValueError("LLM returned invalid JSON.") from exc
        
        except ValidationError as exc:
            raise ValueError(
                f"LLM response schema validation failed: {exc}"
            ) from exc
