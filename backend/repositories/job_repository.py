from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from models.domain import Job, Customer
from schemas.domain import JobCreate, JobUpdate

class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, tenant_id: UUID) -> List[Job]:
        """Fetch all jobs belonging to the tenant."""
        # Note: We enforce tenant isolation here directly on the Job entity
        query = select(Job).options(selectinload(Job.appointments), selectinload(Job.messages)).where(Job.tenant_id == tenant_id).order_by(Job.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, job_id: UUID, tenant_id: UUID) -> Optional[Job]:
        """Fetch a specific job safely isolated to the tenant."""
        query = select(Job).options(
            selectinload(Job.messages),
            selectinload(Job.appointments)
        ).where(Job.id == job_id, Job.tenant_id == tenant_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, tenant_id: UUID, job_in: JobCreate) -> Optional[Job]:
        """Create a new job, throwing an error implicitly if the customer_id doesn't match the tenant."""
        # 1. Verify Customer exists and belongs to THIS tenant
        customer_query = select(Customer).where(Customer.id == job_in.customer_id, Customer.tenant_id == tenant_id)
        cust_result = await self.db.execute(customer_query)
        if not cust_result.scalar_one_or_none():
             return None # Customer not found or doesn't belong to tenant

        # 2. Create Job
        new_job = Job(
            tenant_id=tenant_id,
            customer_id=job_in.customer_id,
            title=job_in.title,
            description=job_in.description,
            status=job_in.status.value,
            urgency=job_in.urgency.value,
            estimated_price=job_in.estimated_price
        )
        self.db.add(new_job)
        await self.db.commit()
        # Re-fetch with eager-loaded relationships to avoid MissingGreenlet
        return await self.get_by_id(new_job.id, tenant_id)

    async def update(self, job_id: UUID, tenant_id: UUID, job_data: JobUpdate) -> Optional[Job]:
        """Patch a job (usually to advance Kanban status)."""
        job = await self.get_by_id(job_id, tenant_id)
        if not job:
            return None

        update_data = job_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
             setattr(job, field, value)

        await self.db.commit()
        await self.db.refresh(job)
        return job
