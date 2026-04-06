from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexHealth HMS"
    
    DATABASE_URL: str = "postgresql://postgres:acid_123@localhost:5432/hospital_db"
   

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()