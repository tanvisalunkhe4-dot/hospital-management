from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.core.auth import decode_access_token # Assuming you have a JWT decoding function

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    
    payload = decode_access_token(token)
    user_id = payload.get("sub") # Rename this to reflect it's an ID
    
    if user_id is None:
        raise credentials_exception
        
    # 🟢 CHANGE: Filter by ID instead of email
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()    
    if user is None:
        raise credentials_exception
        
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user