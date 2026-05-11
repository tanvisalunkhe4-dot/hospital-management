import os
from jose import JWTError, jwt
from fastapi import HTTPException, status
from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db import models
from app.db.session import get_db
from fastapi.security import OAuth2PasswordBearer
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # This ensures your server won't even start if the .env is broken
    raise ValueError("SECRET_KEY is not set in the environment variables!")

ALGORITHM = "HS256" # 🟢 Ensure this is NOT indented

def decode_access_token(token: str):
    try:
        # It's good practice to print the payload once during debugging
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_access_token(token)

    sub = payload.get("sub")

    print("TOKEN SUB:", sub)

    # Validate token payload
    if sub is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    user = None

    # CASE 1: Token contains numeric user ID
    if str(sub).isdigit():
        user = db.query(models.User).filter(
            models.User.id == int(sub)
        ).first()

    # CASE 2: Token contains email
    else:
        email = str(sub).strip().lower()

        user = db.query(models.User).filter(
            models.User.email.ilike(email)
        ).first()

    print("FOUND USER:", user)

    # Final validation
    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user