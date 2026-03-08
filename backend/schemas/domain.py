from pydantic import BaseModel, ConfigDict, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List
import enum

# Enums (must match DB)
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

class UserRole(str, enum.Enum):
    OWNER = "owner"
    DISPATCHER = "dispatcher"
    TECHNICIAN = "technician"

# Base response structure with audit fields
class AuditResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# -----------------
# TENANTS
# -----------------
class TenantResponse(AuditResponse):
    name: str

class TenantUpdate(BaseModel):
    name: Optional[str] = None

# -----------------
# USERS
# -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.TECHNICIAN

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserResponse(UserBase, AuditResponse):
    pass

class UserCreate(UserBase):
    password: str

# -----------------
# CUSTOMERS
# -----------------
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase, AuditResponse):
    pass

# -----------------
# MESSAGES
# -----------------
class MessageChannel(str, enum.Enum):
    SMS = "sms"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SYSTEM = "system"

class MessageDirection(str, enum.Enum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"

class MessageBase(BaseModel):
    job_id: UUID
    channel: MessageChannel = MessageChannel.SYSTEM
    direction: MessageDirection = MessageDirection.OUTBOUND
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase, AuditResponse):
    pass

# -----------------
# APPOINTMENTS
# -----------------
class AppointmentBase(BaseModel):
    job_id: UUID
    technician_id: Optional[UUID] = None
    scheduled_time: str # ISO Format
    duration_minutes: Optional[int] = 60

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase, AuditResponse):
    pass

# -----------------
# JOBS
# -----------------
class JobBase(BaseModel):
    customer_id: UUID
    title: str
    description: Optional[str] = None
    status: JobStatus = JobStatus.NEW
    urgency: JobUrgency = JobUrgency.NORMAL
    estimated_price: Optional[float] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    urgency: Optional[JobUrgency] = None
    status: Optional[JobStatus] = None
    estimated_price: Optional[float] = None
    final_price: Optional[float] = None
    description: Optional[str] = None

class JobResponse(JobBase, AuditResponse):
    final_price: Optional[float] = None
    messages: List[MessageResponse] = []
    appointments: List[AppointmentResponse] = []

