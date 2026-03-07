from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from schemas.domain import JobCreate, JobUpdate, JobResponse
from services.job_service import JobService

router = APIRouter()

def get_job_service(db: AsyncSession = Depends(get_db)) -> JobService:
    return JobService(db)

@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: JobService = Depends(get_job_service)
):
    """
    List all inbound and active jobs for the authenticated tenant.
    """
    return await service.list_jobs(tenant_id)

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_in: JobCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: JobService = Depends(get_job_service)
):
    """
    Create a new job. Must be mapped to an existing customer in this tenant.
    """
    job = await service.create_job(tenant_id, job_in)
    if not job:
          raise HTTPException(status_code=400, detail="Invalid Customer ID or permission denied")
    return job

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: JobService = Depends(get_job_service)
):
    """Get single job details."""
    job = await service.get_job(job_id, tenant_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    job_data: JobUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: JobService = Depends(get_job_service)
):
    """Update job fields (e.g. status transition on Kanban board)."""
    job = await service.update_job(job_id, tenant_id, job_data)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
