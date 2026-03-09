from app.db.session import engine
from app.db.base import Base
from app.models.organization import Organization
from app.models.user import User

def create_everything():
    # This tells us EXACTLY where the tables are going
    print(f"Target Database: {engine.url}")
    
    try:
        print("Dropping existing tables (if any) to reset...")
        Base.metadata.drop_all(bind=engine) 
        
        print("Creating new tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Success! Tables created: ", Base.metadata.tables.keys())
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    create_everything()