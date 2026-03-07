from fastapi import FastAPI
from routers.v1 import jobs
from core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for the AI-assisted service dispatch SaaS MVP",
    version="0.1.0"
)

# Include API routers
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
