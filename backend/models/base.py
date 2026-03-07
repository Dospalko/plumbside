from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, func, ForeignKey
from uuid import UUID, uuid4
import datetime

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative mapping."""
    pass

class TenantAwareModel(Base):
    """
    Abstract base class for all business entities ensuring tenant isolation 
    and providing common audit fields.
    """
    __abstract__ = True
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True, nullable=False)
    
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
