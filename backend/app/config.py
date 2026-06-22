from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path
import 

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL")
    jwt_secret_key: str = os.getenv('jwt_secret_key')
    jwt_algorithm: str = os.getenv('jwt_algorithm') 
    access_token_expire_minutes: int = 15

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        extra="ignore"
    )


settings = Settings()

