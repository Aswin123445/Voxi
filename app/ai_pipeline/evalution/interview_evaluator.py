import logging

from app.ai_pipeline.evalution.base_evaluator import BaseEvaluator
from app.ai_pipeline.evalution.interview_evaluation_schema import InterviewEvaluationResult

logger = logging.getLogger(__name__)


class InterviewEvaluator(BaseEvaluator):

    def __init__(
        self,
        ollama_client,
        prompt_builder,
        response_parser,
    ):
        self.ollama_client = ollama_client
        self.prompt_builder = prompt_builder
        self.response_parser = response_parser

    async def evaluate(
        self,
        interview_data: dict,
    ):

        # 1. Build final interview evaluation prompts
        system_prompt, user_prompt = self.prompt_builder.build_prompts(interview_data)

        # 2. Call LLM through OllamaClient
        raw_response = await self.ollama_client.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_schema = InterviewEvaluationResult.model_json_schema()
        )

        logger.info(
            "Raw interview evaluation response: %s",
            raw_response,
        )

        # 3. Parse and validate LLM response
        result = self.response_parser.parse(raw_response)

        # 4. Return validated final assessment
        return result
