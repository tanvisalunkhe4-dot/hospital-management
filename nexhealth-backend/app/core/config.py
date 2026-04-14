from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexHealth HMS"
    
    # DATABASE_URL is fetched from the .env file if available, 
    # otherwise it defaults to the local PostgreSQL string below.
    DATABASE_URL: str = "postgresql://postgres:Janhavi12@localhost:5432/hospital_db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()