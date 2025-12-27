# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    ENV: str = "dev"
    SCAN_INTERVAL_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
