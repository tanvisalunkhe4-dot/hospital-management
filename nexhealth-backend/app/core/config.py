from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NexHealth HMS"
    DATABASE_URL: str="postgresql://postgres.bifnvetonbntwtisrtjv:HMS-tanvi%4044@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

print("USING DB:", settings.DATABASE_URL)