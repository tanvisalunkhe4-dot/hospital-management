from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexHealth HMS"
    DATABASE_URL: str = "postgresql://postgres:Janhavi12@localhost:5432/hospital_db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

print("USING DB:", settings.DATABASE_URL)