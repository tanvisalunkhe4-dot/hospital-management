from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User

# This tells FastAPI where to find the login token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

SECRET_KEY = "nexhealth_secret_key" # Change this in production!
ALGORITHM = "HS256"

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception

        return user
    except (JWTError, ValueError, TypeError):
        # JWTError: bad token/signature/expiry
        # ValueError/TypeError: sub missing or not int-castable
        raise credentials_exception

def get_current_active_user(current_user: User = Depends(get_current_user)):
    # Treat only an explicit False flag as inactive to avoid blocking
    # legacy rows where is_active may be null/unset.
    if current_user.is_active is False:
        raise HTTPException(status_code=403, detail="Inactive user")
    return current_user