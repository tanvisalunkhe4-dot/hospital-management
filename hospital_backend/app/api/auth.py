from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.organization import Organization
from app.models.users import User
from app.schemas.auth import SignupRequest, Token # Using your provided schemas
from app.core.security import get_password_hash, create_access_token

from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token
from app.schemas.auth import Token # Your existing Token schema

# ... keep your signup code here ...

router = APIRouter()

@router.post("/signup", response_model=Token)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # 1. Check if email already exists
    user_exists = db.query(User).filter(User.email == request.admin_email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # 2. Create the Organization (Hospital)
        new_org = Organization(
            name=request.organization_name
            # gstin=request.gstin (If you added this to your schema/model)
        )
        db.add(new_org)
        db.flush() # This gives us new_org.id to use for the user

        # 3. Create the Admin User
        new_admin = User(
            name=request.admin_name, # This works now that we added it to the model!
            email=request.admin_email,
            hashed_password=get_password_hash(request.password),
            role="admin",
            organization_id=new_org.id
        )
        db.add(new_admin)
        
        db.commit()
        db.refresh(new_admin)
        
        # 4. Generate token
        access_token = create_access_token(subject=new_admin.email)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": new_admin 
        }
    except Exception as e:
        db.rollback()
        print(f"Error during signup: {str(e)}") # Useful for debugging in terminal
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # 1. Look for the user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create the token
    access_token = create_access_token(subject=user.email)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user # This maps to your UserInfo schema
    }