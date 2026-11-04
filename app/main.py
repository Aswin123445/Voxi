from fastapi import FastAPI

from app.core.config import settings


def create_application() -> FastAPI:

    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        debug=settings.DEBUG,
        description="Real-time AI Voice Interview Platform",
    )


    @app.get("/")
    async def root():
        return {"application": "Voxi", "message": "Voxi API is running"}
    return app


app = create_application()
