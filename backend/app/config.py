from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str = "your-secret-key-change-this"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

