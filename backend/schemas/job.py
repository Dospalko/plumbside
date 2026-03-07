from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class JobBase(BaseModel):
    customer_id: UUID
    description: str
    status: str = "new"
    estimated_price: float | None = None

class JobCreate(JobBase):
    # Additional fields specific to creation can be added here
    pass

class JobResponse(JobBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
