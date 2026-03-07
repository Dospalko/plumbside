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
