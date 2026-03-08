from uuid import UUID
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from repositories.message_repository import MessageRepository
from schemas.domain import MessageCreate, MessageResponse

class MessageService:
    def __init__(self, db: AsyncSession):
        self.repo = MessageRepository(db)

    async def create_message(self, tenant_id: UUID, message_in: MessageCreate) -> Optional[MessageResponse]:
        message = await self.repo.create(tenant_id, message_in)
        if message:
            return MessageResponse.model_validate(message)
        return None
