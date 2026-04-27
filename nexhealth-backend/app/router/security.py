import pyotp
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models

# Import your auth dependency from its actual home 
# (usually where you decode the JWT, e.g., app.core.auth or app.deps)
from app.dependancy import get_current_active_user 

router = APIRouter(prefix="/auth", tags=["Security"])

@router.get("/2fa/setup")
def setup_2fa(
    current_user: models.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    # Generate secret if it doesn't exist
    if not current_user.two_factor_secret:
        current_user.two_factor_secret = pyotp.random_base32()
        db.commit()

    totp = pyotp.TOTP(current_user.two_factor_secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email, 
        issuer_name="NexHealth India"
    )
    
    return {"qr_uri": provisioning_uri}

@router.post("/2fa/verify")
def verify_2fa(
    code: str, 
    current_user: models.User = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    if not current_user.two_factor_secret:
        raise HTTPException(status_code=400, detail="2FA not initialized")
        
    totp = pyotp.TOTP(current_user.two_factor_secret)
    
    if totp.verify(code):
        current_user.is_2fa_enabled = True
        db.commit()
        return {"message": "Two-Factor Authentication enabled successfully"}
    
    raise HTTPException(status_code=400, detail="Invalid verification code")