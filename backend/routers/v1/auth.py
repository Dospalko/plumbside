from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Placeholder authentication endpoint for MVP.
    In a real scenario, this verifies the user and tenant in the DB and signs a JWT.
    """
    # TODO: Connect to User models and verify hash
    if form_data.username == "admin@example.com" and form_data.password == "admin":
        return {"access_token": "mock-jwt-token-replace-me", "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.get("/me")
async def read_users_me():
    """Placeholder to return current user info"""
    return {"email": "admin@example.com", "role": "owner"}
