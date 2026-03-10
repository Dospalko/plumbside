import asyncio
from uuid import uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import AsyncSessionLocal, engine
from models.domain import Tenant, User, Customer, Job, UserRole, JobStatus, JobUrgency
from core.security import get_password_hash

async def seed_db():
    async with AsyncSessionLocal() as db:
        # Create a Demo Tenant
        tenant_id = uuid4()
        demo_tenant = Tenant(id=tenant_id, name="PlumbSide Demo Corp")
        db.add(demo_tenant)

        # Create an Owner User
        hashed_pw = get_password_hash("admin123")
        owner = User(
            id=uuid4(),
            tenant_id=tenant_id,
            email="admin@example.com",
            full_name="Ferko Mrkvicka",
            hashed_password=hashed_pw,
            role=UserRole.OWNER.value,
            is_super_admin=True
        )
        db.add(owner)

        # Create a Demo Customer
        customer_id = uuid4()
        demo_customer = Customer(
            id=customer_id,
            tenant_id=tenant_id,
            name="Jozef Ilko",
            phone="+421 911 222 333",
            email="jozef.ilko@pocasie.sk",
            address="Dlha ulica 1, Bratislava"
        )
        db.add(demo_customer)

        # Create a newly inbound Demo Job
        new_job = Job(
            id=uuid4(),
            tenant_id=tenant_id,
            customer_id=customer_id,
            title="Prasknute potrubie v kupelni",
            description="Tečie voda z pod umyvada, treba to co najskor pozriet.",
            status=JobStatus.NEW.value,
            urgency=JobUrgency.HIGH.value
        )
        db.add(new_job)

        await db.commit()
        print("✅ Database successfully seeded with Demo Tenant, Admin User, Customer, and Job.")

if __name__ == "__main__":
    asyncio.run(seed_db())
