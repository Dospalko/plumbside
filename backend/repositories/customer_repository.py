from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, update
from typing import List, Optional
from uuid import UUID

from models.domain import Customer
from schemas.domain import CustomerCreate

class CustomerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, tenant_id: UUID) -> List[Customer]:
        """Fetch all customers strictly belonging to the given tenant."""
        query = select(Customer).where(Customer.tenant_id == tenant_id).order_by(Customer.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, customer_id: UUID, tenant_id: UUID) -> Optional[Customer]:
        """Fetch a specific customer by ID, ensuring they belong to the tenant."""
        query = select(Customer).where(Customer.id == customer_id, Customer.tenant_id == tenant_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, customer_in: CustomerCreate) -> Customer:
        """Create a new customer linked to the active tenant."""
        new_customer = Customer(
            tenant_id=tenant_id,
            name=customer_in.name,
            phone=customer_in.phone,
            email=customer_in.email,
            address=customer_in.address,
            notes=customer_in.notes
        )
        self.db.add(new_customer)
        await self.db.commit()
        await self.db.refresh(new_customer)
        return new_customer
