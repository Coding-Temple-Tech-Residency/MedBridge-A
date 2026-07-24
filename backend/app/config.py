"""Application configuration.

Every field here is required — deliberately. Pydantic raises at startup if any
is missing from the environment, which is what plan §8 asks for: "Missing
values should cause startup to fail with a clear error message — do not allow
the app to run with missing configuration."

Do not add defaults. A default for jwt_secret_key means that if the env var is
ever absent (a forgotten setting on a deploy), the app starts happily and signs
every auth token with a string that is public in this repo — anyone reading the
source could forge a token for any user, and nothing would look wrong. A
default for database_url means silently running against the wrong database.
Both failures are invisible; a startup crash is not.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
