from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO_LOG,
    future=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autoflush=False,
    autocommit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function that yields database sessions.
    Automatically closes the session after the request finishes.
    """
    async with AsyncSessionLocal() as session:
        yield session
