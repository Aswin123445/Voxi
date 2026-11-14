from app.ai_pipeline.evalution.base_evaluator import BaseEvaluator
from app.ai_pipeline.evalution.evaluation_schema import AnswerEvaluationResult, EvaluationInput
from app.ai_pipeline.evalution.rubrics import RUBRIC_REGISTRY
from app.ai_pipeline.evalution.evaluation_schema import LLMEvaluationResponse
import logging

class AnswerEvaluator(BaseEvaluator):

    def __init__(self, ollama_client, prompt_builder, response_parser):
        self.ollama_client = ollama_client
        self.prompt_builder = prompt_builder
        self.response_parser = response_parser

    async def evaluate(
        self,
        evaluation_input: EvaluationInput,
    ) -> AnswerEvaluationResult:
        logger = logging.getLogger(__name__)


        # 1. Build evaluation prompt
        system_prompt, user_prompt = self.prompt_builder.build_prompts(evaluation_input)

        # 2. Call LLM through OllamaClient
        raw_response = await self.ollama_client.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema = LLMEvaluationResponse.model_json_schema()
        )
        # 3. Select rubric
        rubric = RUBRIC_REGISTRY[evaluation_input.stage]
        expected_criteria = list(rubric["criteria"].keys())
        logger.info("Raw LLM response: %s", raw_response)
        logger.info("LLM response length: %d", len(raw_response))
        logger.debug("LLM raw response: %s", raw_response)
        llm_result = self.response_parser.parse(
            raw_response,
            expected_criteria,
        )
        weighted_score = sum(
            finding.score * rubric["criteria"][finding.criterion]["weight"]
            for finding in llm_result.findings
        )

        # 6. Return final result
        return AnswerEvaluationResult(
            score=round(weighted_score, 2),
            findings=llm_result.findings,
            summary=llm_result.summary,
        )
