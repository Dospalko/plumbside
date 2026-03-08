from pydantic import BaseModel, Field
from typing import Optional
from schemas.domain import JobUrgency

class JobDraftExtraction(BaseModel):
    customer_name: Optional[str] = Field(None, description="Meno zákazníka alebo firmy, ak je spomenuté (Slovak).")
    customer_phone: Optional[str] = Field(None, description="Telefónne číslo zákazníka, ak je spomenuté.")
    customer_address: Optional[str] = Field(None, description="Presná adresa pre výjazd, ak je spomenutá.")
    job_title: str = Field(..., description="Krátky, výstižný názov problému (max 5 slov) v slovenčine.")
    job_description: Optional[str] = Field(None, description="Detailný popis problému vyextrahovaný z textu v slovenčine.")
    job_urgency: JobUrgency = Field(default=JobUrgency.NORMAL, description="Odhadovaná naliehavosť (LOW, NORMAL, HIGH, CRITICAL).")
