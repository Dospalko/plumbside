from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, EmailStr
from uuid import UUID

from core.database import get_db
from core.dependencies import get_super_admin_user
from core.security import get_password_hash
from models.domain import Tenant, User, UserRole

router = APIRouter()

# --- Schemas ---

class TenantListResponse(BaseModel):
    id: UUID
    name: str
    created_at: str
    user_count: int

class CreateTenantRequest(BaseModel):
    company_name: str
    admin_email: EmailStr
    admin_name: str
    admin_password: str

class CreateTenantResponse(BaseModel):
    tenant_id: UUID
    message: str

# --- Endpoints ---

@router.get("/tenants", response_model=list[TenantListResponse])
async def list_all_tenants(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_super_admin_user)
):
    """
    SUPER ADMIN ONLY: List all tenants in the system along with their user counts.
    """
    query = select(
        Tenant, 
        func.count(User.id).label("user_count")
    ).outerjoin(User, Tenant.id == User.tenant_id).group_by(Tenant.id)
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        TenantListResponse(
            id=row.Tenant.id,
            name=row.Tenant.name,
            created_at=row.Tenant.created_at.isoformat(),
            user_count=row.user_count
        )
        for row in rows
    ]

@router.post("/tenants", response_model=CreateTenantResponse)
async def create_new_tenant(
    data: CreateTenantRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_super_admin_user)
):
    """
    SUPER ADMIN ONLY: Create a new Tenant and its first OWNER User at the same time.
    """
    # 1. Check if email already exists globally
    query = select(User).where(User.email == data.admin_email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Tento e-mail sa už v systéme nachádza.")
    
    # 2. Create Tenant
    new_tenant = Tenant(name=data.company_name)
    db.add(new_tenant)
    await db.flush() # To get the tenant ID
    
    # 3. Create Admin User for this tenant
    hashed_pw = get_password_hash(data.admin_password)
    new_user = User(
        tenant_id=new_tenant.id,
        email=data.admin_email,
        full_name=data.admin_name,
        hashed_password=hashed_pw,
        role=UserRole.OWNER.value
    )
    db.add(new_user)
    
    await db.commit()
    
    return CreateTenantResponse(
        tenant_id=new_tenant.id,
        message=f"Firma '{data.company_name}' a účet '{data.admin_email}' boli úspešne vytvorené."
    )

@router.delete("/tenants/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_super_admin_user)
):
    """
    SUPER ADMIN ONLY: Delete a tenant. Cascades to users, jobs, customers via DB constraints.
    """
    query = select(Tenant).where(Tenant.id == tenant_id)
    result = await db.execute(query)
    tenant = result.scalar_one_or_none()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    await db.delete(tenant)
    await db.commit()
    return None
