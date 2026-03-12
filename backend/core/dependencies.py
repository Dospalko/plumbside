from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from uuid import UUID
import jwt
from jwt.exceptions import InvalidTokenError

from core.database import get_db
from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except InvalidTokenError:
        raise credentials_exception

async def get_current_tenant_id(payload: dict = Depends(get_current_token_payload)) -> UUID:
    """
    Extracts the current tenant ID from the validated JWT token payload.
    This guarantees that the user is authorized and we strictly isolate their data.
    """
    tenant_id_str: str = payload.get("tenant_id")
    if tenant_id_str is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing tenant definition")
    try:
        return UUID(tenant_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Tenant ID format in token")

async def get_current_user_id(payload: dict = Depends(get_current_token_payload)) -> UUID:
    """
    Extracts the current user ID from the validated JWT token payload ('sub' claim).
    """
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing user definition")
    try:
        return UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid User ID format in token")

async def get_current_user(
    user_id: UUID = Depends(get_current_user_id),
    db = Depends(get_db)
):
    from sqlalchemy import select
    from models.domain import User
    
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_super_admin_user(current_user = Depends(get_current_user)):
    """
    Verifies that the current user has the super admin flag.
    """
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Nemáte administrátorské oprávnenia pre túto akciu."
        )
    return current_user

async def get_owner_user(current_user = Depends(get_current_user)):
    """
    Verifies that the current user has the owner role.
    """
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Túto akciu môže vykonať iba majiteľ (owner)."
        )
    return current_user
