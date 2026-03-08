from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from schemas.domain import JobCreate, JobUpdate, JobResponse, MessageCreate, MessageResponse, AppointmentCreate, AppointmentResponse
from schemas.ai import JobDraftExtraction
from services.job_service import JobService
from services.message_service import MessageService
from services.appointment_service import AppointmentService
from services.ai_service import AIService

router = APIRouter()

def get_job_service(db: AsyncSession = Depends(get_db)) -> JobService:
    return JobService(db)

def get_message_service(db: AsyncSession = Depends(get_db)) -> MessageService:
    return MessageService(db)

def get_appointment_service(db: AsyncSession = Depends(get_db)) -> AppointmentService:
    return AppointmentService(db)

def get_ai_service() -> AIService:
    return AIService()

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

@router.post("/{job_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    job_id: UUID,
    message_in: MessageCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: MessageService = Depends(get_message_service)
):
    """Add a new message (note/log) to a job."""
    if message_in.job_id != job_id:
        raise HTTPException(status_code=400, detail="Job ID mismatch")
    
    msg = await service.create_message(tenant_id, message_in)
    if not msg:
        raise HTTPException(status_code=404, detail="Job not found or permission denied")
    return msg

@router.post("/{job_id}/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    job_id: UUID,
    appointment_in: AppointmentCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: AppointmentService = Depends(get_appointment_service)
):
    """Schedule an appointment for a job."""
    if appointment_in.job_id != job_id:
        raise HTTPException(status_code=400, detail="Job ID mismatch")
        
    appt = await service.create_appointment(tenant_id, appointment_in)
    if not appt:
        raise HTTPException(status_code=404, detail="Job not found or permission denied")
    return appt

@router.post("/ai-intake", response_model=JobDraftExtraction)
async def ai_intake(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    tenant_id: UUID = Depends(get_current_tenant_id),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Parse an uploaded voice note or a text note using OpenAI to extract Job drafting details.
    """
    if not text and not file:
        raise HTTPException(status_code=400, detail="Musíte poskytnúť text alebo audio súbor.")

    content_to_parse = text
    if file:
        audio_bytes = await file.read()
        if len(audio_bytes) > 0:
            content_to_parse = await ai_service.transcribe_audio(audio_bytes, file.filename)

    if not content_to_parse:
        raise HTTPException(status_code=400, detail="Nepodarilo sa dešifrovať text z audia alebo je prázdny.")

    try:
        draft = await ai_service.extract_job_info(content_to_parse)
        return draft
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
