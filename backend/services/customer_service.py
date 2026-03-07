from uuid import UUID
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from repositories.customer_repository import CustomerRepository
from schemas.domain import CustomerCreate, CustomerResponse

class CustomerService:
    def __init__(self, db: AsyncSession):
        self.repo = CustomerRepository(db)

    async def list_customers(self, tenant_id: UUID) -> List[CustomerResponse]:
        customers = await self.repo.get_all(tenant_id)
        return [CustomerResponse.model_validate(c) for c in customers]

    async def get_customer(self, customer_id: UUID, tenant_id: UUID) -> Optional[CustomerResponse]:
        customer = await self.repo.get_by_id(customer_id, tenant_id)
        if customer:
            return CustomerResponse.model_validate(customer)
        return None

    async def create_customer(self, tenant_id: UUID, customer_in: CustomerCreate) -> CustomerResponse:
        customer = await self.repo.create(tenant_id, customer_in)
        return CustomerResponse.model_validate(customer)
