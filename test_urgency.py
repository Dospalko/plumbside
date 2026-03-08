import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from core.database import async_session_maker
from models.domain import Job
from repositories.job_repository import JobRepository
from schemas.domain import JobUpdate, JobUrgency
from sqlalchemy import select

async def main():
    async with async_session_maker() as db:
        repo = JobRepository(db)
        
        # Pick the first job
        result = await db.execute(select(Job))
        job = result.scalars().first()
        if not job:
            print("No jobs found")
            return
            
        print(f"Original urgency: {job.urgency}")
        
        # Try to update
        job_data = JobUpdate(urgency=JobUrgency.CRITICAL)
        updated = await repo.update(job.id, job.tenant_id, job_data)
        if updated:
            print(f"Updated urgency: {updated.urgency}")
        else:
            print("Failed to update")

if __name__ == "__main__":
    asyncio.run(main())
