from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from schemas.domain import CustomerCreate, CustomerResponse
from services.customer_service import CustomerService

router = APIRouter()

def get_customer_service(db: AsyncSession = Depends(get_db)) -> CustomerService:
    return CustomerService(db)

@router.get("/", response_model=List[CustomerResponse])
async def list_customers(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CustomerService = Depends(get_customer_service)
):
    """
    List all customers for the authenticated tenant.
    """
    return await service.list_customers(tenant_id)

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CustomerService = Depends(get_customer_service)
):
    """
    Create a new customer profile under the authenticated tenant.
    """
    return await service.create_customer(tenant_id, customer_in)

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CustomerService = Depends(get_customer_service)
):
    """
    Get specific customer details by ID. Returns 404 if not found or belongs to another tenant.
    """
    customer = await service.get_customer(customer_id, tenant_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
