from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from models.domain import Message, Job
from schemas.domain import MessageCreate

class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_job_id(self, job_id: UUID, tenant_id: UUID) -> List[Message]:
        query = select(Message).join(Job).where(
            Message.job_id == job_id,
            Job.tenant_id == tenant_id
        ).order_by(Message.created_at.asc())
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, tenant_id: UUID, message_in: MessageCreate) -> Optional[Message]:
        # Verify Job belongs to Tenant
        query = select(Job).where(Job.id == message_in.job_id, Job.tenant_id == tenant_id)
        job_result = await self.db.execute(query)
        if not job_result.scalar_one_or_none():
            return None

        new_message = Message(
            tenant_id=tenant_id,
            job_id=message_in.job_id,
            channel=message_in.channel.value,
            direction=message_in.direction.value,
            content=message_in.content
        )
        self.db.add(new_message)
        await self.db.commit()
        await self.db.refresh(new_message)
        return new_message
