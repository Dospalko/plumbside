import enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, ForeignKey, Enum, Float
from uuid import UUID
from typing import List

from .base import TenantAwareModel

class JobStatus(str, enum.Enum):
    NEW = "new"
    TRIAGED = "triaged"
    QUOTED = "quoted"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"

class JobUrgency(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

class Tenant(TenantAwareModel):
    __tablename__ = "tenants"
    name: Mapped[str] = mapped_column(String, nullable=False)
    
    users: Mapped[List["User"]] = relationship(back_populates="tenant")
    customers: Mapped[List["Customer"]] = relationship(back_populates="tenant")
    jobs: Mapped[List["Job"]] = relationship(back_populates="tenant")

class UserRole(str, enum.Enum):
    OWNER = "owner"
    DISPATCHER = "dispatcher"
    TECHNICIAN = "technician"

class User(TenantAwareModel):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.TECHNICIAN, nullable=False)
    
    tenant: Mapped["Tenant"] = relationship(back_populates="users")

class Customer(TenantAwareModel):
    __tablename__ = "customers"
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, index=True, nullable=True)
    email: Mapped[str] = mapped_column(String, index=True, nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="customers")
    jobs: Mapped[List["Job"]] = relationship(back_populates="customer")

class Job(TenantAwareModel):
    __tablename__ = "jobs"
    customer_id: Mapped[UUID] = mapped_column(ForeignKey("customers.id"), index=True, nullable=False)
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.NEW, index=True, nullable=False)
    urgency: Mapped[JobUrgency] = mapped_column(Enum(JobUrgency), default=JobUrgency.NORMAL, nullable=False)
    
    estimated_price: Mapped[float] = mapped_column(Float, nullable=True)
    final_price: Mapped[float] = mapped_column(Float, nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="jobs")
    customer: Mapped["Customer"] = relationship(back_populates="jobs")
    appointments: Mapped[List["Appointment"]] = relationship(back_populates="job")
    messages: Mapped[List["Message"]] = relationship(back_populates="job")
    
class Appointment(TenantAwareModel):
    __tablename__ = "appointments"
    job_id: Mapped[UUID] = mapped_column(ForeignKey("jobs.id"), index=True, nullable=False)
    technician_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    
    scheduled_time: Mapped[str] = mapped_column(String, nullable=False) # Simplified to String/ISO format for MVP instead of dealing with strict TZ DB limits
    duration_minutes: Mapped[int] = mapped_column(nullable=True)

    job: Mapped["Job"] = relationship(back_populates="appointments")
    technician: Mapped["User"] = relationship()

class MessageChannel(str, enum.Enum):
    SMS = "sms"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SYSTEM = "system"

class MessageDirection(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"

class Message(TenantAwareModel):
    __tablename__ = "messages"
    job_id: Mapped[UUID] = mapped_column(ForeignKey("jobs.id"), index=True, nullable=True)
    
    channel: Mapped[MessageChannel] = mapped_column(Enum(MessageChannel), nullable=False)
    direction: Mapped[MessageDirection] = mapped_column(Enum(MessageDirection), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    job: Mapped["Job"] = relationship(back_populates="messages")
