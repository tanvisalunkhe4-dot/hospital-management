import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.routers.organization import router as organization_router
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title="NexHealth API")

# Cross-Platform Configuration (CORS)
origins = [
    "http://localhost",
    "http://localhost:3000", 
    "http://localhost:5173", 
    "*", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(organization_router)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def health_check():
    return {"status": "online", "message": "Hospital Management Backend is Sorted!"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)