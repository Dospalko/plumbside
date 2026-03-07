from fastapi import APIRouter, Depends
from uuid import UUID
from core.dependencies import get_db, get_current_tenant_id
from schemas.job import JobCreate, JobResponse
from services.job_service import JobService
from repositories.job_repository import JobRepository
from typing import List

router = APIRouter()

def get_job_service(db = Depends(get_db)) -> JobService:
    repo = JobRepository(db)
    return JobService(repo)

@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: JobService = Depends(get_job_service)
):
    """Retrieve all jobs for the authenticated tenant."""
    return await service.list_tenant_jobs(tenant_id)

@router.post("/", response_model=JobResponse)
async def create_job(
    job_in: JobCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: JobService = Depends(get_job_service)
):
    """Create a new job associated with the tenant."""
    return await service.create_job(tenant_id, job_in)
