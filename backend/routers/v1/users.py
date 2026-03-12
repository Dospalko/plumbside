from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from core.database import get_db
from core.dependencies import get_current_user_id, get_current_tenant_id, get_owner_user
from core.security import get_password_hash
from models.domain import User
from schemas.domain import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.email is not None:
        user.email = data.email
    if data.password is not None:
        user.hashed_password = get_password_hash(data.password)

    await db.commit()
    await db.refresh(user)
    return user

@router.get("/", response_model=list[UserResponse])
async def list_tenant_users(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    query = select(User).where(User.tenant_id == tenant_id).order_by(User.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

from schemas.domain import UserCreate

@router.post("/", response_model=UserResponse)
async def create_tenant_user(
    data: UserCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    owner_user: User = Depends(get_owner_user)
):
    # Check if email exists
    query = select(User).where(User.email == data.email)
    result = await db.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        tenant_id=tenant_id,
        email=data.email,
        full_name=data.full_name,
        role=data.role,
        is_super_admin=False,
        hashed_password=get_password_hash(data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
from fastapi import status

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant_user(
    user_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    owner_user: User = Depends(get_owner_user)
):
    """
    Delete a user from the tenant (Owner only).
    Cannot delete yourself.
    """
    if str(user_id) == str(owner_user.id):
        raise HTTPException(status_code=400, detail="Nemôžete vymazať vlastný účet.")

    query = select(User).where(User.id == user_id, User.tenant_id == tenant_id)
    result = await db.execute(query)
    user_to_delete = result.scalar_one_or_none()

    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Používateľ sa nenašiel.")

    await db.delete(user_to_delete)
    await db.commit()
    return None
