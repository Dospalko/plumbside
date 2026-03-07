from fastapi import Header, HTTPException
from uuid import UUID

from core.database import get_db

async def get_current_tenant_id(x_tenant_id: UUID = Header(None, alias="X-Tenant-ID")) -> UUID:
    """
    Extracts the current tenant ID from the request headers.
    In a complete setup, this would be extracted and validated from a JWT token.
    For the MVP backend structure, passing it directly helps isolate tenant data routing.
    """
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is missing")
    return x_tenant_id
