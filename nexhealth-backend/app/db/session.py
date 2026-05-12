from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 1. Create the engine with stability settings
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping checks the connection before each use. 
    # If the network flickered, it transparently reconnects.
    pool_pre_ping=True, 
    # pool_recycle forces a connection refresh every hour to prevent stale connections
    pool_recycle=3600,
    # pool_size and max_overflow help manage the number of concurrent connections
    pool_size=5,
    max_overflow=10
)
print("USING DB:", settings.DATABASE_URL)
# 2. Create SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Create the Base class
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()