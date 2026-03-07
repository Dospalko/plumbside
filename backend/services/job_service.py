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
        job = await self.repo.update(job_id, tenant_id, job_in)
        if job:
             return JobResponse.model_validate(job)
        return None
