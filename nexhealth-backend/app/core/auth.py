import os
from jose import JWTError, jwt
from fastapi import HTTPException, status
from dotenv import load_dotenv

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