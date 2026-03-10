import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from models.domain import Message, MessageChannel, MessageDirection, Job, Customer, Tenant

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def send_technician_on_the_way(
        db: AsyncSession, 
        job: Job, 
        customer: Customer, 
        tenant: Tenant
    ):
        """
        Sends an SMS/Email to the customer that the technician is on the way.
        Logs it to the messages table.
        """
        if not tenant.notifications_enabled:
            logger.info(f"Notifications disabled for tenant {tenant.id}. Skipping for job {job.id}.")
            return

        message_content = f"Dobrý deň {customer.name}, Váš inštalatér zo spoločnosti {tenant.name} je práve na ceste k Vám. Prosím, očakávajte jeho príchod."

        # 1. Provide Real SMS/Email Sending Logic here when integrated (e.g. Twilio / Resend)
        if customer.phone:
            logger.info(f"Simulating SMS to {customer.phone}: {message_content}")
            sms_record = Message(
                tenant_id=tenant.id,
                job_id=job.id,
                channel=MessageChannel.SMS.value,
                direction=MessageDirection.OUTBOUND.value,
                content=message_content
            )
            db.add(sms_record)
        
        if customer.email:
            logger.info(f"Simulating Email to {customer.email}: {message_content}")
            email_record = Message(
                tenant_id=tenant.id,
                job_id=job.id,
                channel=MessageChannel.EMAIL.value,
                direction=MessageDirection.OUTBOUND.value,
                content=message_content
            )
            db.add(email_record)
        
        # Flush is not strictly necessary here if caller commits, but good for immediate ID generation if needed later
        # await db.flush() 
