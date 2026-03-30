from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Create the engine
engine = create_engine(settings.DATABASE_URL)

# 2. Create SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class
Base = declarative_base()

# 4. The function Python is complaining about - make sure the name is correct!
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()