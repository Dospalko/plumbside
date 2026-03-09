from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from models.domain import Appointment, Job
from schemas.domain import AppointmentCreate

class AppointmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, tenant_id: UUID, appointment_in: AppointmentCreate) -> Optional[Appointment]:
        # Verify Job belongs to Tenant
        query = select(Job).where(Job.id == appointment_in.job_id, Job.tenant_id == tenant_id)
        job_result = await self.db.execute(query)
        if not job_result.scalar_one_or_none():
            return None

        new_appointment = Appointment(
            tenant_id=tenant_id,
            job_id=appointment_in.job_id,
            technician_id=appointment_in.technician_id,
            scheduled_time=appointment_in.scheduled_time,
            duration_minutes=appointment_in.duration_minutes
        )
        self.db.add(new_appointment)
        await self.db.commit()
        await self.db.refresh(new_appointment)
        return new_appointment

    async def get_all(self, tenant_id: UUID) -> List[Appointment]:
        query = select(Appointment).where(Appointment.tenant_id == tenant_id).order_by(Appointment.scheduled_time.asc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
