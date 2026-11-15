import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

from app.enums.interview_stage import InterviewStage
from app.services.evaluation_service import EvaluationService
from app.services.interview_evaluation_service import InterviewEvaluationService
from app.webrtc.audio_track import GeneratedAudioTrack
from app.services.interview_service import InterviewService
from app.services.conversation_service import ConversationService

logger = logging.getLogger(__name__)


class InterviewOrchestrator:

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        tts_service,
        question_generator,
        media_handler,
        connection_manager,
        answer_evaluator,
        interview_evaluator,
        websocket_event_manager,
    ):
        self.session_factory = session_factory
        self.tts_service = tts_service
        self.question_generator = question_generator
        self.media_handler = media_handler
        self.connection_manager = connection_manager
        self.answer_evaluator = answer_evaluator
        self.interview_evaluator = interview_evaluator
        self.websocket_event_manager = websocket_event_manager
    async def send_event(
        self,
        interview_id: UUID,
        event: str,
        data: dict | None = None,
    ):
        await self.websocket_event_manager.send_event(
            interview_id=interview_id,
            event=event,
            data=data,
        )


    async def publish_runtime_status(
        self,
        interview_id: UUID,
        status: str,
    ) -> None:
        async with self.session_factory() as db:
            conversation_service = ConversationService(db)
    
            turn = await conversation_service.get_active_turn(interview_id)
    
            if turn is None:
                logger.warning(
                    "[ORCHESTRATOR] Cannot publish runtime status; "
                    "no active turn for interview %s",
                    interview_id,
                )
                return
    
            await self.send_event(
                interview_id=interview_id,
                event="interview.status",
                data={
                    "status": status,
                    "turn_number": turn.turn_number,
                    "stage": turn.stage,
                },
            )
    
            logger.info(
                "[ORCHESTRATOR] Runtime status published: "
                "interview=%s status=%s turn=%s stage=%s",
                interview_id,
                status,
                turn.turn_number,
                turn.stage,
            )

    async def start(self, interview_id: UUID):

        # 1. Open a fresh database session
        async with self.session_factory() as db:

            interview_service = InterviewService(db)
            conversation_service = ConversationService(db)

            # 2. Retrieve interview
            interview = await interview_service.get_interview(interview_id)

            # 3. Determine current stage
            stage = interview.current_stage

            # 4. Check whether a question already exists
            turn = await conversation_service.get_turn_by_stage(
                interview_id=interview_id,
                stage=stage,
            )

            # 5. Generate and save question only if it doesn't exist
            if turn is None:
                question = self.question_generator.generate(InterviewStage(stage))

                turn = await conversation_service.create_turn(
                    interview_id=interview_id,
                    stage=stage,
                    question=question,
                    turn_number=1,
                )

            # Always use the persisted question
            question = turn.question

        # Database session is closed here.

        # 6. Generate speech
        audio_result = await self.tts_service.generate_speech_async(question)

        # 7. Prepare audio frames
        frames = self.media_handler.create_audio_frames(
            audio_result["audio"],
            audio_result["sample_rate"],
        )

        # 8. Create persistent audio track
        audio_track = GeneratedAudioTrack(
            sample_rate=audio_result["sample_rate"],
        )

        # 9. Add initial question audio to the track
        audio_track.add_frames(frames)

        # 10. Attach track to WebRTC connection
        self.connection_manager.add_audio_track(
            interview_id,
            audio_track,
        )
        await self.send_event(
            interview_id=interview_id,
            event="interview.started",
            data={
                "stage": stage,
                "turn_number": turn.turn_number,
            },
        )

        return turn

    def get_next_stage(
        self,
        current_stage: InterviewStage,
    ) -> InterviewStage | None:

        stage_flow = {
            InterviewStage.INTRODUCTION: InterviewStage.EXPERIENCE,
            InterviewStage.EXPERIENCE: InterviewStage.TECHNICAL,
            InterviewStage.TECHNICAL: InterviewStage.EXPECTED_SALARY,
            InterviewStage.EXPECTED_SALARY: None,
        }

        return stage_flow.get(current_stage)

    async def process_answer(
        self,
        interview_id: UUID,
        transcript: str,
    ):
        logger.info(
            "[INTERVIEW ORCHESTRATOR] Candidate answer received: %s",
            interview_id,
        )

        async with self.session_factory() as db:
            # 1. Initialize services
            conversation_service = ConversationService(db)
            interview_service = InterviewService(db)

            interview_evaluation_service = InterviewEvaluationService(
                db=db,
                interview_evaluator=self.interview_evaluator,
            )

            logger.info(
                "[ORCHESTRATOR] Processing transcript: interview_id=%s, transcript=%s",
                interview_id,
                transcript,
            )

            # 2. Find the active conversation turn
            turn = await conversation_service.get_active_turn(interview_id)

            if turn is None:
                logger.warning(
                    "No active conversation turn found: %s",
                    interview_id,
                )
                return
            await self.send_event(
                interview_id=interview_id,
                event="candidate.processing",
                data={
                    "stage": turn.stage,
                    "turn_number": turn.turn_number,
                },
            )

            logger.info(
                "Active turn identified: turn_number=%s, stage=%s",
                turn.turn_number,
                turn.stage,
            )

            # 3. Persist candidate answer
            await conversation_service.update_answer(
                turn_id=turn.id,
                answer=transcript,
            )

            # 4. Mark turn as processing
            await conversation_service.update_turn_status(
                turn_id=turn.id,
                new_status="PROCESSING",
            )

            # 5. Mark conversation turn as completed
            turn = await conversation_service.update_turn_status(
                turn_id=turn.id,
                new_status="COMPLETED",
            )
            await self.send_event(
                interview_id=interview_id,
                event="answer.received",
                data={
                    "stage": turn.stage,
                    "turn_number": turn.turn_number,
                },
            )

            logger.info(
                "Candidate answer saved successfully: turn_number=%s",
                turn.turn_number,
            )

            # 6. Determine next stage
            current_stage = InterviewStage(turn.stage)
            next_stage = self.get_next_stage(current_stage)

            # 7. Check whether the interview has finished
            if next_stage is None:
                logger.info(
                    "All interview stages completed: %s",
                    interview_id,
                )
                await self.send_event(
                    interview_id=interview_id,
                    event="interview.evaluating",
                    data={
                        "status": "PROCESSING",
                    },
                )

                final_evaluation = await interview_evaluation_service.evaluate_interview(
                    interview_id=interview_id,
                )

                await interview_service.complete_interview(interview_id)
                await self.send_event(
                    interview_id=interview_id,
                    event="interview.completed",
                    data={
                        "overall_score": float(final_evaluation.overall_score),
                        "recommendation": final_evaluation.recommendation,
                    },
                )

                logger.info(
                    "Final interview evaluation completed: score=%s",
                    final_evaluation.overall_score,
                )

                return

            logger.info(
                "Next interview stage determined: %s",
                next_stage.value,
            )

            # 8. Generate next question
            next_question = self.question_generator.generate(next_stage)

            # 9. Update interview stage
            await interview_service.update_current_stage(
                interview_id=interview_id,
                next_stage=next_stage,
            )

            # 10. Create next conversation turn
            next_turn = await conversation_service.create_turn(
                interview_id=interview_id,
                stage=next_stage.value,
                question=next_question,
                turn_number=turn.turn_number + 1,
            )

            question = next_turn.question

        # Database session closes here.

        # 11. Generate speech
        audio_result = await self.tts_service.generate_speech_async(question)

        # 12. Prepare audio frames
        frames = self.media_handler.create_audio_frames(
            audio_result["audio"],
            audio_result["sample_rate"],
        )

        # 13. Enqueue frames into existing WebRTC audio track
        self.connection_manager.enqueue_audio(
            interview_id=interview_id,
            frames=frames,
        )
        await self.send_event(
            interview_id=interview_id,
            event="question.audio.queued",
            data={
                "stage": next_turn.stage,
                "turn_number": next_turn.turn_number,
            },
        )

        logger.info(
            "[INTERVIEW ORCHESTRATOR] Next question audio queued: %s",
            interview_id,
        )
