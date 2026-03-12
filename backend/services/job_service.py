from uuid import UUID
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from repositories.job_repository import JobRepository
from schemas.domain import JobCreate, JobUpdate, JobResponse

class JobService:
    def __init__(self, db: AsyncSession):
        self.repo = JobRepository(db)

    async def list_jobs(self, tenant_id: UUID) -> List[JobResponse]:
        jobs = await self.repo.get_all(tenant_id)
        return [JobResponse.model_validate(j) for j in jobs]

    async def get_job(self, job_id: UUID, tenant_id: UUID) -> Optional[JobResponse]:
        job = await self.repo.get_by_id(job_id, tenant_id)
        if job:
            return JobResponse.model_validate(job)
        return None

    async def create_job(self, tenant_id: UUID, job_in: JobCreate) -> Optional[JobResponse]:
        job = await self.repo.create(tenant_id, job_in)
        if job:
            return JobResponse.model_validate(job)
        return None
        
    async def update_job(self, job_id: UUID, tenant_id: UUID, job_in: JobUpdate) -> Optional[JobResponse]:
        # 1. Fetch old job to check status change
        old_job = await self.repo.get_by_id(job_id, tenant_id)
        if not old_job:
            return None
            
        old_status = old_job.status
        
        # 2. Update job
        job = await self.repo.update(job_id, tenant_id, job_in)
        if not job:
            return None
            
        # 3. Trigger Notification if status changed to IN_PROGRESS (from something else)
        if job_in.status is not None and old_status != job.status and job.status.value == "in_progress":
            from services.notifications import NotificationService
            from models.domain import Customer, Tenant
            from sqlalchemy import select
            
            # Fetch Customer and Tenant
            cust_query = select(Customer).where(Customer.id == job.customer_id)
            cust_res = await self.repo.db.execute(cust_query)
            customer = cust_res.scalar_one_or_none()
            
            tenant_query = select(Tenant).where(Tenant.id == tenant_id)
            tenant_res = await self.repo.db.execute(tenant_query)
            tenant = tenant_res.scalar_one_or_none()
            
            if customer and tenant:
                await NotificationService.send_technician_on_the_way(self.repo.db, job, customer, tenant)
                await self.repo.db.commit() # Commit the new messages
        
        return JobResponse.model_validate(job)

    async def delete_job(self, job_id: UUID, tenant_id: UUID) -> bool:
        return await self.repo.delete(job_id, tenant_id)
