# app/config.py

from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "LabelCraft Backend"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:admin@localhost:5432/LabelCraft"
    FRONTEND_ORIGINS: list[str] = ["http://localhost:5173"]


    model_config = {
        "env_file": ".env",
    }



settings = Settings()