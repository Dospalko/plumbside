from uuid import UUID
from repositories.job_repository import JobRepository
from schemas.job import JobCreate

class JobService:
    """
    Business logic layer for Jobs.
    Coordinates between repositories, AI workers, and external services.
    """
    def __init__(self, job_repo: JobRepository):
        self.job_repo = job_repo

    async def list_tenant_jobs(self, tenant_id: UUID):
        # Additional business rules can be applied here before returning data
        return await self.job_repo.list_jobs(tenant_id=tenant_id)

    async def create_job(self, tenant_id: UUID, job_in: JobCreate):
        # e.g., trigger notifications, validate customer existence
        return await self.job_repo.create_job(tenant_id, job_in)
