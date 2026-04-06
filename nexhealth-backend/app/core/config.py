from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexHealth HMS"
    
    # Corrected URL with the @ symbol
    DATABASE_URL: str
    # Standardized indentation for these variables
   

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()