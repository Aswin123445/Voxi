from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # Application settings
    APP_NAME: str = "Voxi"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database settings
    DATABASE_URL: str

    # Pydantic configuration
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
