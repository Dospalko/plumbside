from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from repositories.appointment_repository import AppointmentRepository
from schemas.domain import AppointmentCreate, AppointmentResponse

class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.repo = AppointmentRepository(db)

    async def create_appointment(self, tenant_id: UUID, appointment_in: AppointmentCreate) -> Optional[AppointmentResponse]:
        appointment = await self.repo.create(tenant_id, appointment_in)
        if appointment:
            return AppointmentResponse.model_validate(appointment)
        return None
