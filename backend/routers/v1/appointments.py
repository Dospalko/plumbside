from fastapi import APIRouter, Depends
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.dependencies import get_current_tenant_id
from schemas.domain import AppointmentResponse
from services.appointment_service import AppointmentService

router = APIRouter()

def get_appointment_service(db: AsyncSession = Depends(get_db)) -> AppointmentService:
    return AppointmentService(db)

@router.get("/", response_model=List[AppointmentResponse])
async def list_appointments(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: AppointmentService = Depends(get_appointment_service)
):
    """
    List all appointments for the authenticated tenant.
    """
    return await service.list_appointments(tenant_id)
