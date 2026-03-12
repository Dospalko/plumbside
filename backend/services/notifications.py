import asyncio
import logging
import resend
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from models.domain import Message, MessageChannel, MessageDirection, Job, Customer, Tenant
from core.config import settings

logger = logging.getLogger(__name__)

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY

class NotificationService:
    @staticmethod
    async def send_technician_on_the_way(
        db: AsyncSession, 
        job: Job, 
        customer: Customer, 
        tenant: Tenant
    ):
        """
        Sends an real Email (via Resend) to the customer that the technician is on the way.
        Still simulates SMS.
        Logs it to the messages table.
        """
        if not tenant.notifications_enabled:
            logger.info(f"Notifications disabled for tenant {tenant.id}. Skipping for job {job.id}.")
            return

        message_content = f"Dobrý deň {customer.name},\n\nVáš inštalatér zo spoločnosti {tenant.name} je práve na ceste k Vám riešiť zákazku: {job.title}.\n\nProsím, očakávajte jeho príchod.\n\nS pozdravom,\nTím {tenant.name}"

        # 1. SMS (Still Simulated for now unless Twilio is added)
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
        
        # 2. Real Email via Resend
        if customer.email:
            logger.info(f"Attempting Email to {customer.email} via Resend: {message_content}")
            
            try:
                if settings.RESEND_API_KEY:
                    # 'onboarding@resend.dev' allows sending to the verified email address only.
                    # For production, you would attach your own domain.
                    r_params = {
                        "from": "PlumbSide Notifikácie <onboarding@resend.dev>",
                        "to": [customer.email],
                        "subject": f"[{tenant.name}] Inštalatér je na ceste",
                        "text": message_content
                    }
                    loop = asyncio.get_event_loop()
                    email_response = await loop.run_in_executor(None, resend.Emails.send, r_params)
                    logger.info(f"Resend sent successfully: {email_response}")
                    
                else:
                    logger.warning("RESEND_API_KEY is not set. Simulating email drop.")

                email_record = Message(
                    tenant_id=tenant.id,
                    job_id=job.id,
                    channel=MessageChannel.EMAIL.value,
                    direction=MessageDirection.OUTBOUND.value,
                    content=message_content
                )
                db.add(email_record)

            except Exception as e:
                logger.error(f"Failed to send email via resend: {e}")
                
        # Flush is not strictly necessary here if caller commits, but good for immediate ID generation if needed later
        # await db.flush() 
