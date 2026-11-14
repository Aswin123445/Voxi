import asyncio
import logging
from contextlib import asynccontextmanager
from app.webrtc.websocket_event_manager import WebSocketEventManager
from fastapi import FastAPI

from app.ai_pipeline.evalution.answer_evaluator import AnswerEvaluator
from app.ai_pipeline.evalution.interview_evaluator import InterviewEvaluator
from app.ai_pipeline.evalution.interview_prompt_builder import InterviewPromptBuilder
from app.ai_pipeline.evalution.interview_response_parser import InterviewResponseParser
from app.ai_pipeline.evalution.prompt_builder import PromptBuilder
from app.ai_pipeline.evalution.response_parser import ResponseParser
from app.ai_pipeline.llm.ollama_client import OllamaClient
from app.core.config import settings
from app.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import AsyncSessionLocal, engine

from app.services.evaluation_service import EvaluationService
from app.webrtc.connection_manager import ConnectionManager
from app.orchestrator.interview_orchestrator import InterviewOrchestrator

from app.ai_pipeline.audio.tts_service import TTSService
from app.ai_pipeline.audio.stt_service import STTService

# Adjust these imports to match your actual file locations.
from app.ai_pipeline.question_generator import QuestionGenerator
from app.webrtc.media_handler import MediaHandler

# Logging configuration
logging.basicConfig(level=logging.INFO)

# Suppress noisy third-party WebRTC logs
logging.getLogger("aiortc").setLevel(logging.WARNING)
logging.getLogger("aioice").setLevel(logging.WARNING)
from app.api.v1 import webrtc

@asynccontextmanager
async def lifespan(app: FastAPI):

    logger = logging.getLogger(__name__)

    logger.info("[APP] Initializing shared components")

    # 1. Initialize TTS Service
    tts_service = TTSService()

    await asyncio.to_thread(tts_service.load_model)

    logger.info("[APP] TTS service initialized")

    # 2. Initialize STT Service
    stt_service = await asyncio.to_thread(
        STTService,
        model_size="base.en",
        device="cpu",
        compute_type="int8",
    )

    logger.info("[APP] STT service initialized")
    ollama_client = OllamaClient()
    prompt_builder = PromptBuilder()
    response_parser = ResponseParser()

    answer_evaluator = AnswerEvaluator(
        ollama_client=ollama_client,
        prompt_builder=prompt_builder,
        response_parser=response_parser,
    )
    interview_evaluator = InterviewEvaluator(
        ollama_client=ollama_client,
        prompt_builder=InterviewPromptBuilder(),
        response_parser=InterviewResponseParser(),
    )

    # 3. Initialize Question Generator
    question_generator = QuestionGenerator()

    # 4. Initialize Media Handler
    media_handler = MediaHandler()

    # 5. Initialize Connection Manager
    connection_manager = ConnectionManager(
        stt_service=stt_service,
    )
    websocket_event_manager = WebSocketEventManager()
    # 6. Initialize Interview Orchestrator
    interview_orchestrator = InterviewOrchestrator(
        session_factory=AsyncSessionLocal,
        tts_service=tts_service,
        question_generator=question_generator,
        media_handler=media_handler,
        connection_manager=connection_manager,
        answer_evaluator=answer_evaluator,
        interview_evaluator=interview_evaluator,
        websocket_event_manager = websocket_event_manager
    )

    # 7. Connect Orchestrator with Connection Manager
    connection_manager.set_interview_orchestrator(interview_orchestrator)

    # 8. Store shared components in application state
    app.state.tts_service = tts_service
    app.state.stt_service = stt_service
    app.state.connection_manager = connection_manager
    app.state.interview_orchestrator = interview_orchestrator
    app.state.websocket_event_manager = websocket_event_manager

    logger.info("[APP] Application startup completed")

    try:
        yield

    finally:
        # Application shutdown
        logger.info("[APP] Application shutting down")

        # Close active WebRTC connections
        for interview_id in list(connection_manager.connections.keys()):
            await connection_manager.close_connection(interview_id)

        # Dispose database engine
        await engine.dispose()

        logger.info("[APP] Application shutdown completed")


def create_application() -> FastAPI:

    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        debug=settings.DEBUG,
        description="Real-time AI Voice Interview Platform",
        lifespan=lifespan,
    )

    # Register API routes
    app.include_router(
        api_router,
        prefix="/api/v1",
    )
    app.include_router(webrtc.router)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_application()
