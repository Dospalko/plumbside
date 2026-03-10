from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from core.database import get_db
from core.dependencies import get_current_tenant_id, get_current_user_id
from models.domain import Tenant
from schemas.domain import TenantResponse, TenantUpdate

router = APIRouter()

@router.get("/me", response_model=TenantResponse)
async def get_my_tenant(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(Tenant).where(Tenant.id == tenant_id)
    result = await db.execute(query)
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.patch("/me", response_model=TenantResponse)
async def update_my_tenant(
    data: TenantUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(Tenant).where(Tenant.id == tenant_id)
    result = await db.execute(query)
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    if data.name is not None:
        tenant.name = data.name

    if data.notifications_enabled is not None:
        tenant.notifications_enabled = data.notifications_enabled

    await db.commit()
    await db.refresh(tenant)
    return tenant
