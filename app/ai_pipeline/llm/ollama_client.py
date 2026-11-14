import httpx
import logging

logger = logging.getLogger(__name__)
from app.core.config import settings
from app.ai_pipeline.evalution.evaluation_schema import (
    LLMEvaluationResponse,
)

class OllamaClient:

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT


    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: dict,
    ) -> str:
    
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            "stream": False,
            "think": False,
            "format": response_schema,
            "options": {
                "temperature": 0.2,
            },
        }
    
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url.rstrip('/')}/api/chat",
                    json=payload,
                )
    
                if response.is_error:
                    logger.error(
                        "[OLLAMA] Request failed | Status: %s | Body: %s",
                        response.status_code,
                        response.text,
                    )
    
                response.raise_for_status()
    
                data = response.json()
    
                logger.info("[OLLAMA] Done: %s", data.get("done"))
                logger.info(
                    "[OLLAMA] Done reason: %s",
                    data.get("done_reason"),
                )
                logger.info(
                    "[OLLAMA] Prompt tokens: %s",
                    data.get("prompt_eval_count"),
                )
                logger.info(
                    "[OLLAMA] Generated tokens: %s",
                    data.get("eval_count"),
                )
    
                content = data.get("message", {}).get("content")
    
                if not content:
                    raise ValueError("Ollama returned an empty response.")
    
                logger.info(
                    "[OLLAMA] Response length: %s",
                    len(content),
                )
    
                return content
    
        except httpx.TimeoutException as exc:
            logger.exception("[OLLAMA] Request timed out.")
            raise RuntimeError("Ollama request timed out.") from exc
    
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Ollama returned HTTP {exc.response.status_code}: " f"{exc.response.text}"
            ) from exc
    
        except httpx.RequestError as exc:
            logger.exception("[OLLAMA] Connection error.")
            raise RuntimeError("Unable to connect to Ollama.") from exc
