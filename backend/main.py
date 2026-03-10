from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.v1 import jobs, auth, customers, users, tenants, appointments
from core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for the AI-assisted service dispatch SaaS MVP",
    version=settings.VERSION
)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://plumbside.me",
        "https://www.plumbside.me"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(tenants.router, prefix="/api/v1/tenants", tags=["Tenants"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
