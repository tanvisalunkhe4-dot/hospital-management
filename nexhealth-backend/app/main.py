from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.router.auth import router as auth_router
from app.router.admin import router as admin_router
from app.router.superadmin import router as superadmin_router

from app.db.session import engine
from app.db import models
# Initialize the Database tables
models.Base.metadata.create_all(bind=engine)

# FIXED: You must define the 'app' instance BEFORE adding middleware or routes
app = FastAPI(title="NexHealth Digital Spine")

# CORS Configuration for your React (Vite) frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Matches your Vite port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your route nodes
app.include_router(superadmin_router)

app.include_router(auth_router)
app.include_router(admin_router)

@app.get("/")
def health_check():
    return {"status": "NexHealth Node Online", "version": "1.0.0"}